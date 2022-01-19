import { FileManager, Filename } from "../Lexer/manager";
import { isWhiteSpace, isNewline } from "../Basic/utility"

test("Testing File Manager [Reading File]", () => {
    const mang = new FileManager(new Filename("./Test/prog1.dark"));
    expect(mang.size()).toBe(258);
    expect(mang.isEmpty()).toBe(false);
});

test("Testing File Manager [Reading Non-exiting File]", () => {
    const temp = console.error;
    console.error = () => null
    const mang = new FileManager(new Filename("./Test/213123.dark"));
    expect(mang.size()).toBe(0);
    expect(mang.isEmpty()).toBe(true);
    console.error = temp;
});

test("Testing File Manager [Providing program as a text]", () => {
    const prog = `list[label: "Fruits"]{
            $[0] = Apple
            $[1] = Orange
            $[2] = Tomato
            $[3] = Mango
        }[list]
    `;
    const mang = new FileManager(prog);
    expect(mang.size()).toBe(prog.length);
    expect(mang.isEmpty()).toBe(false);
    expect(mang.currChar()).toEqual("l");
    expect(mang.substr(0,4)).toEqual("list");
    expect(mang.currPos()).toBe(0);
    expect(mang.peek(12312)).toEqual(null);
    expect(mang.peek()).toEqual('i');
});

test("Testing File Manager [Checking White Space]", () => {
    const prog = " \r\t\v";
    const mang = new FileManager(prog);
    expect(mang.size()).toBe(prog.length);
    expect(mang.isEmpty()).toBe(false);
    while(!mang.isEmpty()){
        expect(isWhiteSpace(mang.currChar())).toBe(true);
        mang.consumeChar();
    }
});

test("Testing File Manager [Checking Skip while]", () => {
    const prog = " \r\t\vH";
    const mang = new FileManager(prog);
    expect(mang.size()).toBe(prog.length);
    expect(mang.isEmpty()).toBe(false);
    mang.skipWhile(isWhiteSpace);
    expect(mang.currChar()).toBe("H");
});


test("Testing File Manager [Checking New Line]", () => {
    const prog = "\n";
    const mang = new FileManager(prog);
    expect(mang.size()).toBe(prog.length);
    expect(mang.isEmpty()).toBe(false);
    expect(isNewline(mang.currChar())).toBe(true);
});

test("Testing File Manager [Consume Char]", () => {
    const prog = "1\n2";
    const mang = new FileManager(prog);
    expect(mang.size()).toBe(prog.length);
    expect(mang.isEmpty()).toBe(false);
    expect([mang.col, mang.line]).toStrictEqual([1,1]);
    expect(mang.consumeChar()).toBe(true);
    expect([mang.col, mang.line]).toStrictEqual([1,2]);
    expect(mang.consumeChar()).toBe(true);
    expect([mang.col, mang.line]).toStrictEqual([2,2]);
    expect(mang.consumeChar()).toBe(true);
});