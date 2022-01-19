import { Location, Span } from "../Basic/location";
import {TokenKind, Token, StringToToken} from "../Lexer/token"

test("Testing String to Token" , ()=>{
    expect( StringToToken["["] ).toBe(TokenKind.LeftSquareBracket);
    expect( StringToToken["]"] ).toBe(TokenKind.RightSquareBracket);
    expect( StringToToken["{"] ).toBe(TokenKind.LeftCurlyBrace);
    expect( StringToToken["}"] ).toBe(TokenKind.RightCurlyBrace);
    expect( StringToToken["("] ).toBe(TokenKind.LeftRoundBrace);
    expect( StringToToken[")"] ).toBe(TokenKind.RightRoundBrace);
    expect( StringToToken["\""] ).toBe(TokenKind.DoubleQuote);
    expect( StringToToken["'"] ).toBe(TokenKind.SingleQuote);
    expect( StringToToken["`"] ).toBe(TokenKind.BackTick);
    expect( StringToToken[","] ).toBe(TokenKind.Comma);
    expect( StringToToken["->"] ).toBe(TokenKind.Arrow);
    expect( StringToToken[":"] ).toBe(TokenKind.Colon);
    expect( StringToToken["="] ).toBe(TokenKind.Equal);
    // expect( StringToToken["Unknown"] ).toBe(TokenKind.Unknown);
    // expect( StringToToken["Identifier"] ).toBe(TokenKind.Identifier);
    // expect( StringToToken["Text"] ).toBe(TokenKind.Text);
    // expect( StringToToken["Keyword"] ).toBe(TokenKind.Keyword);
    // expect( StringToToken["Number"] ).toBe(TokenKind.Number);
    expect( StringToToken["\0"] ).toBe(TokenKind.EOF);
    expect( StringToToken["\\"] ).toBe(TokenKind.Escape);
    expect( StringToToken["\n"] ).toBe(TokenKind.Newline);
    expect( StringToToken["$"] ).toBe(TokenKind.Dollar);
    expect( StringToToken[" "] ).toBe(TokenKind.Space);
    expect( StringToToken[";"] ).toBe(TokenKind.SemiColon);
});

test("Testing Token Class", () => {
    const token : Token = new Token(TokenKind.Number, "12345", new Location(new Span(0,5), 1, 1));
    expect(token.kind).toBe(TokenKind.Number);
    expect(token.text).toBe("12345");
    expect(token.loc).toStrictEqual(new Location(new Span(0,5), 1, 1));
    expect(token.isKind(TokenKind.Number)).toBe(true);
    expect(token.isKind(TokenKind.Text)).toBe(false);
});