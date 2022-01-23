import { readFileSync } from "fs";
import path from "path";
import { isWhiteSpace, WhiteSpace } from "../Basic/utility"

export class Filename{
    private _name : string;
    constructor(name : string){
        this._name = path.resolve(name);
    }

    get name() : string { return this._name; }
}

export class FileManager {
    private _fileBuffer? : string;
    private _curr_pos : number;
    private _curr_col : number;
    private _curr_line : number;
    filename? : string;

    constructor(filenameOrString : Filename | string){
        this._curr_pos = 0;
        this._curr_col = 1;
        this._curr_line = 1;
        if (typeof(filenameOrString) === 'string'){
            this._fileBuffer = filenameOrString as string;
        }else{
            this.filename = (filenameOrString as Filename).name;
            try{
                this._fileBuffer = readFileSync(this.filename!, 'utf8');
            }catch(err){
                console.error(err);
            }
        }
    }

    get col() : number { return this._curr_col; }
    get line() : number { return this._curr_line; }
    
    size() : number { return this._fileBuffer !== undefined ? this._fileBuffer.length : 0; }

    substr(start: number, end?: number) : string{
        return this._fileBuffer!.substring(start, end);
    }

    consumeChar() : boolean {
        if(!this.isEmpty()){
            const c = this._fileBuffer![this._curr_pos];
            if(isWhiteSpace(c,WhiteSpace.Newline)){
                ++this._curr_line;
                this._curr_col = 1;
            }else{
                ++this._curr_col;
            }
            ++this._curr_pos;
            return true;
        }else{
            return false;
        }
    }

    currChar() : string{
        if(!this.isEmpty()){
            return this._fileBuffer![this._curr_pos];
        }
        return "EOF";
    }

    skipWhile(pred : (char : string) => boolean) : number {
        let c = this.currChar();
        let num = 0;
        while( pred(c) && this.consumeChar() ){
            c = this.currChar();
            ++num;
        }
        return num;
    }

    peek(steps: number = 1) : string | null{
        if(!this.isEmpty()){
            const str_len = this._fileBuffer!.length;
            const len = steps > str_len ? steps : this._curr_pos + steps;
            if(str_len > len){
                return this._fileBuffer![len];
            }
        }
        return null;
    }

    isEmpty() : boolean{
        return this._fileBuffer === undefined || this._fileBuffer.length <= this._curr_pos;
    }

    currPos() : number {
        return this._curr_pos;
    }

}