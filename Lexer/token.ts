import { Location, Span } from "../Basic/location";
export enum TokenKind{
    Unknown = "Unknown",
    Identifier = "Identifier",
    Text = "Text",
    Keyword = "Keyword",
    Number = "Number",
    LeftSquareBracket = "[",
    RightSquareBracket = "]",
    LeftCurlyBrace = "{",
    RightCurlyBrace = "}",
    LeftRoundBrace = "(",
    RightRoundBrace = ")",
    DoubleQuote = "\"",
    SingleQuote = "'",
    BackTick = "`",
    Comma = ",",
    Arrow = "->",
    Colon = ":",
    SemiColon = ";",
    Equal = "=",
    Dollar = "$",
    Escape = "\\",
    Newline = "\n",
    Space = ' ',
    EOF = "\0"
}

export const StringToToken : {[key : string] : TokenKind} = {
    "["             : TokenKind.LeftSquareBracket,
    "]"             : TokenKind.RightSquareBracket,
    "{"             : TokenKind.LeftCurlyBrace,
    "}"             : TokenKind.RightCurlyBrace,
    "("             : TokenKind.LeftRoundBrace,
    ")"             : TokenKind.RightRoundBrace,
    "\""            : TokenKind.DoubleQuote,
    "'"             : TokenKind.SingleQuote,
    "`"             : TokenKind.BackTick,
    ","             : TokenKind.Comma,
    "->"            : TokenKind.Arrow,
    ":"             : TokenKind.Colon,
    ";"             : TokenKind.SemiColon,
    "="             : TokenKind.Equal,
    "$"             : TokenKind.Dollar,
    "\\"            : TokenKind.Escape,
    "\n"            : TokenKind.Newline,
    " "             : TokenKind.Space,
    // "Unknown"       : TokenKind.Unknown,
    // "Identifier"    : TokenKind.Identifier,
    // "Text"          : TokenKind.Text,
    // "Keyword"       : TokenKind.Keyword,
    // "Number"        : TokenKind.Number,
    "\0"            : TokenKind.EOF,
}

export class Token{
    private _kind : TokenKind = TokenKind.Unknown;
    private _text : string;
    private _loc : Location;

    constructor(kind : TokenKind, text : string, loc : Location){
        this._kind = kind;
        this._text = text;
        this._loc = loc;
    }

    get kind(){ return this._kind; }
    get text(){ return this._text; }
    get loc(){ return this._loc; }

    set kind(kind : TokenKind) { this._kind = kind; }

    isKind(kind : TokenKind) : boolean{ return this._kind == kind; }
}

const escapeString = (text:string) =>{
    let temp = "";
    for(let c of text){
        switch(c){
            case '\n': temp += "\\n";
                break;
            case '\b': temp += "\\b";
                break;
            case '\f': temp += "\\f";
                break;
            case '\v': temp += "\\v";
                break;
            case '\r': temp += "\\r";
                break;
            case '\t': temp += "\\t";
                break;
            case '\0': temp += "\\0";
                break;
            case '\'': temp += "\\'";
                break;
            case '\"': temp += '\\"';
                break;
            case '\\': temp += '\\';
                break;
            default: temp += c;
        }
    }
    return temp;
}

export class Tokens{
    private _token : Array<Token>;
    private _curr_pos: number;

    constructor(token : Array<Token>){
        this._token = token;
        this._curr_pos = 0;
    }

    skipWhileSpace() : void {
        while(this._token[this._curr_pos].isKind(TokenKind.Space))
            ++this._curr_pos;
    }

    currTok() : Token {
        if(!this.isEmpty()){
            return this._token[this._curr_pos];
        }
        return this._token[this._token.length - 1];
    }

    currText() : string {
        return this.currTok().text;
    }

    currTextEscaped() : string {
        return escapeString(this.currTok().text);
    }

    next(shouldSkipWhiteSpace : boolean = true) : Token{
        if(shouldSkipWhiteSpace) this.skipWhileSpace();
        this._curr_pos = Math.min(this._token.length - 1, this._curr_pos + 1);
        return this._token[this._curr_pos];
    }

    peek(steps : number = 1) : Token | null{
        const len = this._token.length;
        if(this._curr_pos + steps < len){
            return this._token[this._curr_pos + steps];
        }
        return null;
    }

    isEmpty() : boolean{
        return this._token.length <= this._curr_pos;
    }
}

