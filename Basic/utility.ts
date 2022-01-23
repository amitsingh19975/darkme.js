
export enum WhiteSpace{
    Newline = '\n',
    Space = ' ',
    Formfeed = '\f',
    Carriage = '\r',
    Tab = '\t',
    Backspace = '\b',
    VerticalTab = '\v'
}

export function isWhiteSpace(c : string, type? : WhiteSpace) : boolean {
    return type ? c == type : /\s/.test(c);
}