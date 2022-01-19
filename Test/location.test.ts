import { Span, Location } from "../Basic/location";

test("Testing Span", () => {
    const s1 = new Span(0, 10);
    const s2 = new Span(3, 4);
    expect([s1.start,s1.end]).toStrictEqual([0,10]);
    expect([s2.start,s2.end]).toStrictEqual([3,4]);
    expect(s1).toStrictEqual(new Span(0,10));
    expect(s1.size()).toStrictEqual(10);
});

test("Testing Location", () => {
    const s1 = new Location(new Span(0, 10), 1, 1);
    expect([s1.span,s1.col, s1.line]).toStrictEqual([new Span(0,10), 1, 1]);
    expect(s1).toStrictEqual(new Location(new Span(0, 10), 1, 1));
    
    s1.col = 2;
    s1.line = 2;
    s1.span = new Span(3,3);
    expect(s1.col).toStrictEqual(2);
    expect(s1.line).toStrictEqual(2);
    expect(s1.span).toStrictEqual(new Span(3,3));
    expect(s1.offset(s1, new Span(100,100), 1, 1)).toStrictEqual(new Location(new Span(100,100), 3, 3));
});