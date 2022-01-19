export function isNewline(c : string) : boolean {
    return c == '\n';
}

export function isWhiteSpace(c : string) : boolean {
    return /\s/g.test(c);
}