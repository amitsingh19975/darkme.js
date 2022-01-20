import {Block, StringBlock, ProgramBlock, AttributesType, ArrayOfBlockBodyType, BlockBodyType} from "./type";
import { Lexer } from "../Lexer/lexer";
import { Token, TokenKind, Tokens } from "../Lexer/token";
import { err_message } from "../Basic/error";
import { exit } from "process";
import util from 'util';

export enum Loop{
    Continue,
    Break
}

export class Ast{
    private _tokens : Tokens;
    private _filename: string;
    private _anonNumber: number;
    private _depth : number;
    private _program? : ProgramBlock;
    private _shouldEscapeEverythingInsideBlock: boolean;

    constructor(lexer : Lexer){
        lexer.parse();
        this._anonNumber = 0;
        this._depth = 0;
        this._tokens = new Tokens(lexer.tokens);
        this._shouldEscapeEverythingInsideBlock = false;
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

    parseBlock(block: Block) : void{
        if(this._isKind(TokenKind.EOF)){
            return;
        }
        this._skipWhiteSpace();
        const tok = this._tok();
        if(!tok.isKind(TokenKind.Text)){
            this.err(this._tok(), "no block declaration found");
        }
    
        let attrs : AttributesType = {};
        let body : ArrayOfBlockBodyType = [];
        this._next();
        this.parseAttributes(attrs);
        if("@escape" in attrs) this._shouldEscapeEverythingInsideBlock = true;
        this.parseBody(body);
        this._shouldEscapeEverythingInsideBlock = false;
        block.addBlock(new Block(tok.text, body, attrs));
        this.parseBlock(block);
    }

    parseInterpolation(parentBody: ArrayOfBlockBodyType) : void {
        const tok = this._tok();
        let blockName = "";
        this._skipWhiteSpace();
        if(tok.isKind(TokenKind.Text)){
            blockName = tok.text;
            this._next();
        }else{
            blockName = `@anonymousBlock${this._anonNumber++}`;
        }
    
        let attrs : AttributesType = {};
        let body : ArrayOfBlockBodyType = [];

        this.parseAttributes(attrs);
        if("@escape" in attrs) this._shouldEscapeEverythingInsideBlock = true;
        this.parseBody(body);
        this._shouldEscapeEverythingInsideBlock = false;
        parentBody.push(new Block(blockName, body, attrs));
    }
    
    parseAttribute(attrs: AttributesType): void{
        let key : string = "";
        let val : string = "";

        if(this._isKind(TokenKind.DoubleQuote)){
            this._next();
            key = this.parseString();
        }else{
            if(!this._isKind(TokenKind.Text)){
                this.err(this._tok(), `expected attribute key text, but found '${this._text(true)}'`)
            }
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
    
    parseAttributes(attrs: AttributesType): void{
        if(!this._isKind(TokenKind.LeftSquareBracket)){
            this._skipWhiteSpace()
            if(!this._isKind(TokenKind.LeftCurlyBrace)){
                this.err(this._tok(), `expected '{', but found '${this._text(true)}'`);
            }
            return;
        }

        this._next();

        this._while(TokenKind.RightSquareBracket, (tok : Token) => {
            this._skipWhiteSpace();

            this.parseAttribute(attrs);
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
    
    parseBodyAsString(): string{
        let text: string = "";
        let escape = false;
        while(!this._tokens.isEmpty()){
            if(this._depth < 0){
                this.err(this._tok(), "found extra '}', or maybe you are missing '{'");
            }

            if(this._isKind(TokenKind.Escape) && !this._shouldEscapeEverythingInsideBlock) {
                escape = !escape;
                if(!escape) text += '\\';
            }else if(!escape){
                if(this._isKind(TokenKind.RightCurlyBrace) && this._depth == 0) break;
                else if(this._isKind(TokenKind.RightCurlyBrace) && this._depth != 0) {
                    --this._depth;
                    text += "}";
                }
                else if(this._isKind(TokenKind.Dollar) && !this._shouldEscapeEverythingInsideBlock) return text;
                else if(this._isKind(TokenKind.LeftCurlyBrace)) {
                    ++this._depth;
                    text += "{";
                }else{
                    text += this._text();
                }
                escape = false;
            }else if(this._isKind(TokenKind.Space)){
                text += this.get_prefix(this._text());
            }
            // console.log(text);
            this._next(false);
        }
        if(!this._isKind(TokenKind.RightCurlyBrace)){
            this.err(this._tok(), `expected '}', but found '${this._text(true)}'`);
        }
        return text;
    }
    
    parseBody(blocks: ArrayOfBlockBodyType): void{
        if(!this._isKind(TokenKind.LeftCurlyBrace)){
            this.err(this._tok(), `expected '{', but found '${this._text(true)}'`);
        }
        this._next();
        
        let prefix = "";
        if(this._isKind(TokenKind.Space)){
            prefix = this.get_prefix(this._text());
            this._skipWhiteSpace();
        }

        this._while(TokenKind.RightCurlyBrace, (tok : Token) => {
            const temp = this.parseBodyAsString();
            if(temp.trim().length != 0){
                blocks.push(new StringBlock(prefix + temp, {}));
                prefix = "";
            }

            if(!this._shouldEscapeEverythingInsideBlock && this._isKind(TokenKind.Dollar)){
                this._next();
                this.parseInterpolation(blocks);
                // this._next(false);
            }
            return Loop.Continue;
        });

        if(!this._isKind(TokenKind.RightCurlyBrace)){
            this.err(this._tok(), `expected '}', but found '${this._text(true)}'`);
        }
        this._next();
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