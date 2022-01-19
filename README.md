# darkme.js

Parser for custom readme format for it to be used by javascript to generate custom readme pages.

## Example

### Program

```
header[class: "header", id: "Blink"]{
	This is a $[bold]{header} for the document
	$list[label: "Fruits"]{
		$[0]{ Apple }
		$[1]{ Orange }
		$[2]{ Tomato }
		$[3]{ Mango }
	}
}

list[label: "Fruits"]{
	$[0]{ Apple }
	$[1]{ Orange }
	$[2]{ Tomato }
	$[3]{ Mango }
}

code[lang: "cpp"]{
	auto t = tensor<float>(extents<1,2,3,4>{{}{{{}}}{}},1.f);
}
```
### AST

```json
{
    "_kind": "@Program",
    "_body": [{
        "_kind": "header",
        "_body": [{
            "_kind": "@String",
            "_body": ["\tThis is a "],
            "_attrs": {}
        }, {
            "_kind": "@anonymousBlock0",
            "_body": [{
                "_kind": "@String",
                "_body": ["header"],
                "_attrs": {}
            }],
            "_attrs": {
                "bold": ""
            }
        }, {
            "_kind": "@String",
            "_body": [" for the document\t"],
            "_attrs": {}
        }, {
            "_kind": "list",
            "_body": [{
                "_kind": "@anonymousBlock1",
                "_body": [{
                    "_kind": "@String",
                    "_body": [" Apple "],
                    "_attrs": {}
                }],
                "_attrs": {
                    "0": ""
                }
            }, {
                "_kind": "@anonymousBlock2",
                "_body": [{
                    "_kind": "@String",
                    "_body": [" Orange "],
                    "_attrs": {}
                }],
                "_attrs": {
                    "1": ""
                }
            }, {
                "_kind": "@anonymousBlock3",
                "_body": [{
                    "_kind": "@String",
                    "_body": [" Tomato "],
                    "_attrs": {}
                }],
                "_attrs": {
                    "2": ""
                }
            }, {
                "_kind": "@anonymousBlock4",
                "_body": [{
                    "_kind": "@String",
                    "_body": [" Mango "],
                    "_attrs": {}
                }],
                "_attrs": {
                    "3": ""
                }
            }],
            "_attrs": {
                "label": "Fruits"
            }
        }],
        "_attrs": {
            "class": "header",
            "id": "Blink"
        }
    }, {
        "_kind": "list",
        "_body": [{
            "_kind": "@anonymousBlock5",
            "_body": [{
                "_kind": "@String",
                "_body": [" Apple "],
                "_attrs": {}
            }],
            "_attrs": {
                "0": ""
            }
        }, {
            "_kind": "@anonymousBlock6",
            "_body": [{
                "_kind": "@String",
                "_body": [" Orange "],
                "_attrs": {}
            }],
            "_attrs": {
                "1": ""
            }
        }, {
            "_kind": "@anonymousBlock7",
            "_body": [{
                "_kind": "@String",
                "_body": [" Tomato "],
                "_attrs": {}
            }],
            "_attrs": {
                "2": ""
            }
        }, {
            "_kind": "@anonymousBlock8",
            "_body": [{
                "_kind": "@String",
                "_body": [" Mango "],
                "_attrs": {}
            }],
            "_attrs": {
                "3": ""
            }
        }],
        "_attrs": {
            "label": "Fruits"
        }
    }, {
        "_kind": "code",
        "_body": [{
            "_kind": "@String",
            "_body": ["\tauto t = tensor<float>(extents<1,2,3,4>{{}{{{}}}{}},1.f);"],
            "_attrs": {}
        }],
        "_attrs": {
            "lang": "cpp"
        }
    }],
    "_attrs": {}
}
```
