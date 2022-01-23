import {Lexer} from "./Lexer/lexer";
import { Filename } from "./Lexer/manager";
import { Ast, AstWalker, Loop } from "./Parser/ast";
import { AttributesType, Block } from "./Parser/type";
import util from 'util';
// function sum (num1:number, num2:number){
//     return num1 + num2;
// }
const lex = new Lexer(new Filename("./Test/prog2.dark"))
// lex.parse();
// console.log(util.inspect(lex, {showHidden: false, depth: null, colors: true}));
const ast = new Ast(new Lexer(new Filename("./Test/prog2.dark")))
ast.run();
ast.show();
// const astWalker = new AstWalker(ast);
// console.log(astWalker.match("header")?.getAllChildernKinds());
// console.log(lex.tokens);
// console.log(JSON.stringify(lex.tokens));