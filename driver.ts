import {Lexer} from "./Lexer/lexer";
import { Filename } from "./Lexer/manager";
import { Ast } from "./Parser/ast";
// function sum (num1:number, num2:number){
//     return num1 + num2;
// }
const ast = new Ast(new Lexer(new Filename("./Test/prog2.dark")))
ast.run();
// console.log(lex.tokens);
// console.log(JSON.stringify(lex.tokens));