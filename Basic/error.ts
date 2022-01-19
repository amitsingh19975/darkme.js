import { Token } from "../Lexer/token";

export function err_message(filename: string, token : Token, mess: string){
    console.error(`${filename}:${token.loc.line}:${token.loc.col}: error: ${mess}`);
}