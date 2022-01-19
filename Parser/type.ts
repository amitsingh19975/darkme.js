export type BlockBodyType = String | Block;
export type ArrayOfBlockBodyType = BlockBodyType [];
export type AttributesType = {[key : string] : string };

export class Block {
    private _kind: string;
    private _body: ArrayOfBlockBodyType;
    private _attrs: AttributesType

    constructor(kind : string, body: ArrayOfBlockBodyType, attrs: AttributesType){
        this._kind = kind;
        this._body = body;
        this._attrs = attrs;
    }

    get kind() : string { return this._kind; }
    get body() : ArrayOfBlockBodyType { return this._body; }
    set body(body : ArrayOfBlockBodyType) { this._body = body; }
    get attrs() : AttributesType { return this._attrs; }
    set attrs(attrs : AttributesType) { this._attrs = attrs; }

    isKind(kind: string) : boolean {
        return this._kind == kind;
    }

    addAttr(key: string, val: string) : void{
        this._attrs[key] = val;
    }

    addBlock(block : BlockBodyType) : void {
        this._body.push(block);
    }
}

export class ProgramBlock extends Block{
    constructor(){
        super("@Program", [] ,{});
    }
}

export class StringBlock extends Block{
    constructor(body: string, attrs: {[key : string] : string}){
        super("@String", [body], attrs);
    }
}