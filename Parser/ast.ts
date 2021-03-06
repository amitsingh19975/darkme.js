import {Block, StringBlock, ProgramBlock, AttributesType, ArrayOfBlockBodyType, BlockBodyType} from "./type";
import { Lexer } from "../Lexer/lexer";
import { Token, TokenKind, Tokens } from "../Lexer/token";
import { err_message } from "../Basic/error";
import { exit } from "process";
import util from 'util';
import { Location, Span } from "../Basic/location";

export enum Loop{
    Continue,
    Break
}

enum IntrinsicKind{
    None = 0,
    Escape = 1,
}
class Intrinsic{
    private static _strToKind : {[key : string] : IntrinsicKind};
    private _data : number;
    private _dataSnap : number;

    constructor(){
        Intrinsic._strToKind = {
            "@escape" : IntrinsicKind.Escape
        };
        this._data = IntrinsicKind.None;
        this._dataSnap = IntrinsicKind.None;
    }

    setBit(attribute : string | IntrinsicKind) {
        if(typeof(attribute) === "string"){
            if(attribute in Intrinsic._strToKind)
                this._data |= Intrinsic._strToKind[attribute];
        }else{
            this._data |= attribute;
        }
    }

    clearBit(attribute : string | IntrinsicKind) {
        if(typeof(attribute) === "string"){
            if(attribute in Intrinsic._strToKind)
                this._data &= ~Intrinsic._strToKind[attribute];
        }else{
            this._data &= ~attribute;
        }
    }

    setAttribute(attribute : string) : [ boolean, string ]{
        if(attribute.length === 0){
            return [false, "Parsing Error: found the length of intrinsic to be 0."];
        }
        if(attribute[0] === '@'){
            if(!(attribute in Intrinsic._strToKind)) return [false, "no such intrinsic found"];
            this.setBit(attribute);
        }
        return [true,""];
    }

    clearAll() : void {
        this._data = IntrinsicKind.None;
    }

    isSet(attribute : string | IntrinsicKind) : boolean {
        if(typeof(attribute) === "string"){
            if(attribute in Intrinsic._strToKind)
                return ( this._data & Intrinsic._strToKind[attribute] ) != 0;
        }else{
            return (this._data & attribute) != 0;
        }

        return false;
    }

    hasEscape() : boolean{
        return this.isSet(IntrinsicKind.Escape);
    }
}

export class Ast{
    private _tokens : Tokens;
    private _filename: string;
    private _anonNumber: number;
    private _depth : number;
    private _program? : ProgramBlock;

    constructor(lexer : Lexer){
        lexer.parse();
        this._anonNumber = 0;
        this._depth = 0;
        this._tokens = new Tokens(lexer.tokens);
        if(lexer.filename){
            this._filename = lexer.filename;
        }else{
            this._filename = "anonymous filename"
        }
    }

    private err(token : Token, mess : string): void{
        err_message(this._filename, token, mess);
        exit(1);
    }

    private _tok() : Token{
        return this._tokens.currTok();
    }
    
    private _next(shoudSkipWhiteSpace : boolean = true) : Token{
        this._tokens.next(shoudSkipWhiteSpace);
        return this._tok();
    }

    private _text(escape_string : boolean = false) : string{
        return escape_string ? this._tokens.currTextEscaped() : this._tokens.currText();
    }
    
    private _isKind(kind : TokenKind) : boolean{
        return this._tok().isKind(kind);
    }
    
    private _skipWhiteSpace() : void{
        this._tokens.skipWhileSpace();
    }
    
    private _while(kind : TokenKind, body : (tok:Token) => Loop) : Token{
        while(!this._tokens.isEmpty() && !this._isKind(kind)){
            if( body(this._tok()) === Loop.Break ) break;
        }
        return this._tok();
    }

    get program() : ProgramBlock {
        if(!this._program) this.run();
        return this._program!;
    }

    run() : void{
        this._program = new ProgramBlock();
        this.parseBlock(this._program);
    }

    private _setIntrinsic(intr : Intrinsic, attr : Token){
        const res = intr.setAttribute(attr.text);
        if(!res[0]) this.err(attr, res[1]);
    }

    parseBlock(block: Block) : void{
        if(this._isKind(TokenKind.EOF)){
            return;
        }
        this._skipWhiteSpace();
        const tok = this._tok();
        if(!tok.isKind(TokenKind.Text)){
            this.err(this._tok(), "no block declaration found at top level");
        }
        
        let attrs : AttributesType = {};
        let body : ArrayOfBlockBodyType = [];
        let blockName = this._tok().text;

        const intr : Intrinsic = new Intrinsic();

        if(blockName[0] === '!') {
            const sp = new Span(this._tok().loc.span.start, 1)
            const loc = new Location(sp, this._tok().loc.col, this._tok().loc.line);
            this._setIntrinsic(intr, new Token(TokenKind.Text, '@escape', loc));
            blockName = blockName.substring(1);
        }
    
        this._next();
        this.parseAttributes(attrs, intr);

        this.parseBody(body,blockName, intr);

        block.addBlock(new Block(blockName, body, attrs));
        this.parseBlock(block);
    }

    parseInterpolation(parentBody: ArrayOfBlockBodyType) : void {
        const tok = this._tok();
        let blockName = "";
        this._skipWhiteSpace();
        
        let attrs : AttributesType = {};
        let body : ArrayOfBlockBodyType = [];

        const intr : Intrinsic = new Intrinsic();

        if(tok.isKind(TokenKind.Text)){
            blockName = tok.text;
            this._next();
            if(blockName[0] === '!') {
                const sp = new Span(this._tok().loc.span.start, 1)
                const loc = new Location(sp, this._tok().loc.col, this._tok().loc.line);
                this._setIntrinsic(intr, new Token(TokenKind.Text, '@escape', loc));
                blockName = blockName.substring(1);
            }
        }else{
            blockName = `@__anonymousBlock${this._anonNumber++}`;
        }
    

        this.parseAttributes(attrs, intr);

        if("@escape" in attrs) 
            this.err(this._tok(), "escape is not allowed inside block")
        this.parseBody(body,blockName, intr);

        parentBody.push(new Block(blockName, body, attrs));
    }
    
    parseAttribute(attrs: AttributesType, intr : Intrinsic): void{
        let key : string = "";
        let val : string = "";

        if(this._isKind(TokenKind.DoubleQuote)){
            this._next();
            key = this.parseString();
        }else{
            if(!this._isKind(TokenKind.Text)){
                this.err(this._tok(), `expected attribute key text, but found '${this._text(true)}'`)
            }
            this._setIntrinsic(intr, this._tok());
            key = this._text();
            this._next();
            this._skipWhiteSpace();
        }

        if(!this._isKind(TokenKind.Colon)){
            attrs[key] = "";
            return;
        }

        this._next();
        this._skipWhiteSpace();
        if(this._isKind(TokenKind.DoubleQuote)){
            this._next();
            val = this.parseString();
        }else{
            if(!this._isKind(TokenKind.Text)){
                this.err(this._tok(), `expected attribute value text, but found '${this._text(true)}'`)
            }
            val = this._text();
            this._next();
            this._skipWhiteSpace();
        }

        attrs[key] = val;
    }

    parseString() : string {
        let text : string = "";
        this._while(TokenKind.DoubleQuote, (tok : Token) => {
            if(tok.isKind(TokenKind.Escape)){
                tok = this._next(false);
            }

            text += tok.text;
            tok = this._next(false);
            return Loop.Continue;
        });
        
        if(!this._isKind(TokenKind.DoubleQuote)){
            this.err(this._tok(), `expected '"', but found '${this._text(true)}'`)
        }
        this._next();
        this._skipWhiteSpace();
        return text.trim();
    }
    
    parseAttributes(attrs: AttributesType, intr : Intrinsic): void{
        if(!this._isKind(TokenKind.LeftSquareBracket)){
            this._skipWhiteSpace()
            return;
        }

        this._next();

        this._while(TokenKind.RightSquareBracket, (tok : Token) => {
            this._skipWhiteSpace();

            this.parseAttribute(attrs, intr);
            this._skipWhiteSpace();
            if(!this._isKind(TokenKind.RightSquareBracket)){
                if(!this._isKind(TokenKind.Comma)){
                    this.err(this._tok(), `expected ',', but found '${this._text(true)}'`);
                }
                this._next();
            }
            return Loop.Continue;
        })
        
        if(!this._isKind(TokenKind.RightSquareBracket)){
            this.err(this._tok(), `expected ']', but found '${this._text(true)}'`)
        }
        this._next();
    }

    private get_prefix(text : string) : string {
        const pos = text.indexOf('\n');
        if( pos >= 0){
            return text.substring(pos + 1);
        }
        return text;
    }

    parseEndBlock(blockKind: string): boolean{
        this._tokens.takeSnapshot();
        this._next();
        this._skipWhiteSpace();
        
        if(this._tok().isKind(TokenKind.LeftSquareBracket)){
            this._next()
            this._skipWhiteSpace();
            if(this._text() == blockKind){
                this._next()
                this._skipWhiteSpace();
                if(this._tok().isKind(TokenKind.RightSquareBracket)){
                    return true;
                }
            }
        }
        this._tokens.restore();
        return false;
    }
    
    parseBodyAsString(blockKind : string, intr : Intrinsic): [string,boolean]{
        let text: string = "";
        let hasEndBlock = false;
        
        while(!this._tokens.isEmpty()){
            if(this._depth < 0){
                this.err(this._tok(), "found extra '}', or maybe you are missing '{'");
            }

            if(this._isKind(TokenKind.Escape) && !intr.hasEscape()) {
                this._next(false);
                text += this._text();
                
            }else if(this._isKind(TokenKind.RightCurlyBrace)) {
                hasEndBlock = this.parseEndBlock(blockKind);
                if( hasEndBlock ) break;
                if(!intr.hasEscape() && this._depth == 0) break;
                text += "}";
            }else if(this._isKind(TokenKind.RightCurlyBrace) && this._depth != 0) {
                --this._depth;
                text += "}";
            }else if(this._isKind(TokenKind.Dollar) && !intr.hasEscape()) {
                return [text,false];
            }else if(this._isKind(TokenKind.LeftCurlyBrace)) {
                ++this._depth;
                text += "{";
            }else if(this._isKind(TokenKind.WhiteSpace)){
                text += this.get_prefix(this._text());
            }else{
                text += this._text();
            }
            // console.log(text);
            this._next(false);
        }
        
        return [text,hasEndBlock];
    }
    
    parseBody(blocks: ArrayOfBlockBodyType, blockKind: string, intr : Intrinsic): void{
        if(!this._isKind(TokenKind.LeftCurlyBrace)){
            this.err(this._tok(), `expected '{', but found '${this._text(true)}'`);
        }
        this._next();
        const tempDepth = this._depth;
        
        let prefix = "";
        if(this._isKind(TokenKind.WhiteSpace)){
            prefix = this.get_prefix(this._text());
            this._skipWhiteSpace();
        }

        let hasEndBlock = false;
        while(!this._tokens.isEmpty()){
            const temp = this.parseBodyAsString(blockKind, intr);

            const text = temp[0];
            hasEndBlock = temp[1];
            // console.log(text,hasEndBlock);

            if(text.trim().length != 0){
                blocks.push(new StringBlock(prefix + text, {}));
                prefix = "";
            }

            if(!intr.hasEscape() && this._isKind(TokenKind.Dollar)){
                this._next();
                this.parseInterpolation(blocks);
                // this._next(false);
            }
            const isCurly = this._isKind(TokenKind.RightCurlyBrace);
            if( hasEndBlock || isCurly ) break;
        };
        
        const isCurly = this._isKind(TokenKind.RightCurlyBrace);
        const isSq = this._isKind(TokenKind.RightSquareBracket);
        if(!isSq && hasEndBlock)
            this.err(this._tok(), `expected ']', but found '${this._text(true)}'`);
        else if (!isCurly && !hasEndBlock) 
            this.err(this._tok(), `expected '}', but found '${this._text(true)}'`);
        
        this._depth = tempDepth;
        this._next();
        this._skipWhiteSpace();
    }

    show() : void{
        if(this._program){
            console.log(util.inspect(this._program, {showHidden: false, depth: null, colors: true}));
            // console.log(JSON.stringify(this._program));
        }
    }

}

export class AstWalker{
    private _program : ProgramBlock;

    constructor(ast : Ast){
        this._program = ast.program;
    }

    match(kind: string) : Block | null{
        return this._program.match(kind);
    }
}