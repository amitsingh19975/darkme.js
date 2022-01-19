export class Span{
    private _start: number = 0;
    private _end : number = 0

    constructor(start: number, end: number){
        this._start = start;
        this._end = end;
    }

    get start() { return this._start; }
    get end() { return this._end; }

    size() : number { return this._end - this._start; }
}

export class Location{
    private _span : Span;
    private _col : number;
    private _line : number;

    constructor(span : Span, col: number, line: number){
        this._span = span;
        this._col = col;
        this._line = line;
    }

    get col() : number{ return this._col; }
    get line() : number { return this._line; }
    get span() : Span { return this._span; }
    
    set col(col : number){ this._col = col; }
    set line(line : number){ this._line = line; }
    set span(span : Span){ this._span = span; }

    offset(loc : Location, span: Span, col_off: number, line_off: number) : Location{
        return new Location(span, this._col + col_off, this._line + line_off);
    }
}