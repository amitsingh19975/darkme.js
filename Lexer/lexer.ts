import { FileManager, Filename } from "./manager";
import { StringToToken, Token, TokenKind } from "./token";
import { Location, Span } from "../Basic/location";
import { isWhiteSpace, WhiteSpace } from "../Basic/utility";
import { err_message } from "../Basic/error";

export class Lexer{
    tokens : Array<Token> = [];
    filename? : string;
    private _manager : FileManager;
    constructor(filenameOrString : Filename | string){
        this._manager = new FileManager(filenameOrString);
        this.filename = this._manager.filename;
    }

    private _parseWhiteSpace(start: number) : number{
        // '\n\n\n\n \t\t'
        let temp : {[key : string] : [number, Location]} = {};

        while(!this._manager.isEmpty()){
            const c = this._manager.currChar();
            const col = this._manager.col;
            const line = this._manager.line;
            if(!isWhiteSpace(c)) break;
            if(c in temp){
                const el = temp[c];
                ++el[0];
                ++el[1].span.len;
            }else{
                temp[c] = [0, new Location(new Span(start, 1), col, line)];
            }
            ++start;
            this._manager.consumeChar();
        }

        for(let c in temp){
            const rep = temp[c][0];
            const loc = temp[c][1];
            this.tokens.push(new Token(TokenKind.WhiteSpace, c, loc, rep));
        }

        return start;
    }

    private push_token(start : number, tok : TokenKind, text : string, rep : number = 0) : number{
        const col = this._manager.col;
        const line = this._manager.line;
        const len = text.length;
        const loc = new Location(new Span(start, len), col, line);
        this.tokens.push(new Token(tok, text, loc, rep));
        return start + len;
    }

    private nextToken(start: number) : number{
        while(!this._manager.isEmpty()){
            const c = this._manager.currChar();
            // if(isWhiteSpace(c) || (c in StringToToken) || (c == '-' && this._manager.peek() == '>'))
            if(isWhiteSpace(c) || (c in StringToToken))
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
            
            start = this._parseWhiteSpace(start);
            if(this._manager.isEmpty()) break;

            const c = this._manager.currChar();
            if(c in StringToToken){
                this._manager.consumeChar();
                this.push_token(start, StringToToken[c], c);
                ++start;
            }
            // else if (c == '-' && this._manager.peek() == '>'){
            //     this._manager.consumeChar();
            //     this._manager.consumeChar();
            //     this.push_token(start, TokenKind.Arrow, "->");
            //     start += 2;
            // }
                
            const col = this._manager.col;
            const line = this._manager.line
            const end = this.nextToken(start);
            if(end - start > 0){
                const len = end - start;
                const loc = new Location(new Span(start, len), col, line);
                this.tokens.push(new Token(TokenKind.Text, this._manager.substr(start, end), loc));
            }
            
            start = end;
        }
        this.push_token(start, TokenKind.EOF, "EOF");
        return true;
    }
}