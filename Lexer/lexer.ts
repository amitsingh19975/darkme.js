import { FileManager, Filename } from "./manager";
import { StringToToken, Token, TokenKind } from "./token";
import { Location, Span } from "../Basic/location";
import { isWhiteSpace } from "../Basic/utility";

export class Lexer{
    tokens : Array<Token> = [];
    filename? : string;
    private _manager : FileManager;
    constructor(filenameOrString : Filename | string){
        this._manager = new FileManager(filenameOrString);
        this.filename = this._manager.filename;
    }

    private push_token(start : number, tok : TokenKind, text : string) : number{
        const col = this._manager.col;
        const line = this._manager.line;
        const len = text.length;
        const loc = new Location(new Span(start, len), col, line);
        this.tokens.push(new Token(tok, text, loc));
        return start + len;
    }

    private nextToken(start: number) : number{
        while(!this._manager.isEmpty()){
            const c = this._manager.currChar();
            if(isWhiteSpace(c) || (c in StringToToken) || (c == '-' && this._manager.peek() == '>'))
                return this._manager.currPos();

            this._manager.consumeChar();
        }
            
        return this._manager.currPos();
    }

    parse() : boolean{
        if(this.tokens.length != 0) 
            return true;
        if(this._manager.isEmpty()) 
            return false;
        let start = 0;
        while(!this._manager.isEmpty()){
            let rep = this._manager.skipWhile(isWhiteSpace);
            
            const cur_pos = this._manager.currPos();
            if(rep > 0){
                let str = this._manager.substr(start, cur_pos);
                this.push_token(start, TokenKind.Space, str);
                start += str.length;
            }
            
            const c = this._manager.currChar();
            if(c in StringToToken){
                this._manager.consumeChar();
                this.push_token(start, StringToToken[c], c);
                ++start;
            }else if (c == '-' && this._manager.peek() == '>'){
                this._manager.consumeChar();
                this._manager.consumeChar();
                this.push_token(start, TokenKind.Arrow, "->");
                start += 2;
            }
            
            const end = this.nextToken(start);
            if(end - start > 0){
                this.push_token(start, TokenKind.Text, this._manager.substr(start,end));
            }
            
            start = end;
        }
        this.push_token(start, TokenKind.EOF, "\0");
        return true;
    }
}