import { Lexer } from "../Lexer/lexer";
import { Token, TokenKind } from "../Lexer/token"
import { Location, Span } from "../Basic/location"

function make_token(kind : TokenKind, txt : string, start: number, end: number, col : number, line: number) : Token{
    return new Token(kind, txt, new Location(new Span(start, end - start), col, line));
}

test("Testing lexer", () => {
    const prog = `list[label: "Fruits"]{\n\t$[0] = Apple\n}[list]->`;

    const lex = new Lexer(prog);
    expect(lex.tokens.length).toBe(0);
    expect(lex.parse()).toBe(true);

    const prog_tokens = [
        make_token(TokenKind.Text, "list", 0, 4, 5, 1),
        make_token(TokenKind.LeftSquareBracket, "[", 4, 5, 6, 1),
        make_token(TokenKind.Text, "label", 5, 10, 11, 1),
        make_token(TokenKind.Colon, ":", 10, 11, 12, 1),
        make_token(TokenKind.Space, " ", 11, 12, 13, 1),
        make_token(TokenKind.DoubleQuote, "\"", 12, 13, 14, 1),
        make_token(TokenKind.Text, "Fruits", 13, 19, 20, 1),
        make_token(TokenKind.DoubleQuote, "\"", 19, 20, 21, 1),
        make_token(TokenKind.RightSquareBracket, "]", 20, 21, 22, 1),
        make_token(TokenKind.LeftCurlyBrace, "{", 21, 22, 1, 2),
        make_token(TokenKind.Space, "\n\t", 22, 24, 3, 2),
        make_token(TokenKind.Dollar, "$", 24, 25, 4, 2),
        make_token(TokenKind.LeftSquareBracket, "[", 25, 26, 5, 2),
        make_token(TokenKind.Text, "0", 26, 27, 6, 2),
        make_token(TokenKind.RightSquareBracket, "]", 27, 28, 7, 2),
        make_token(TokenKind.Space, " ", 28, 29, 8, 2),
        make_token(TokenKind.Equal, "=", 29, 30, 9, 2),
        make_token(TokenKind.Space, " ", 30, 31, 10, 2),
        make_token(TokenKind.Text, "Apple", 31, 36, 1, 3),
        make_token(TokenKind.Space, "\n", 36, 37, 2, 3),
        make_token(TokenKind.RightCurlyBrace, "}", 37, 38, 3, 3),
        make_token(TokenKind.LeftSquareBracket, "[", 38, 39, 4, 3),
        make_token(TokenKind.Text, "list", 39, 43, 8, 3),
        make_token(TokenKind.RightSquareBracket, "]", 43, 44, 9, 3),
        make_token(TokenKind.Arrow, "->", 44, 46, 10, 3),
        make_token(TokenKind.EOF, "EOF", 46, 47, 10, 3),
    ];
    expect(lex.tokens).toStrictEqual(prog_tokens);
});