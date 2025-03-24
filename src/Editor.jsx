import { useEffect, useState } from "react";
import "./App.css";

function Editor({callback}) {
    const [code, setCode] = useState(`
[multiplexer <d1 <clk >o1 >o2 >o3
    o1 < d1 & H
    o2 < d1 x| L
    o3 < d1 !& H
]

[demultiplexer >o1 <clk <d1 <d2 <d3
    
]

[board <5v <_ 
    multiplexer m
    demultiplexer d
    
    m.clk < 500hz
    d.clk < 500hz
]`);

    const [tree, setTree] = useState([]);

    const operators = ["<", ">", "?", ":", "[", "]"];
    const gates = ["&", "|", "!", "x"];
    const consts = ["_","H","L"];

    const handleKeyDown = (event) => {
        if (event.key === "Tab") {
          event.preventDefault();

          const cursorPosition = event.target.selectionStart;
          const newCode = code.slice(0, cursorPosition) + "    " + code.slice(cursorPosition);
  
          setCode(newCode);

          setTimeout(() => {
            event.target.selectionStart = cursorPosition + 4;
            event.target.selectionEnd = cursorPosition + 4;
          }, 0);
        }
    };

    const highlightSyntax = (text) => {
        const voltagePattern = /\b(\d+(\.\d*)?)v\b/g;
        const hertzPattern = /\b(\d+(\.\d*)?)hz\b/g;
        const circuitNamePattern = /\[\s*(\w+)/g;

        const validGateCombinations = [
            "&", "|", "!", //Basic
            "!&", //Nand
            "!|",//Nor
            "x|", //Xor
            "x!|", //XNor
        ];

        let circuitNames = [];
        let match;

        while ((match = circuitNamePattern.exec(text)) !== null) {
            circuitNames.push(match[1]);
        }

        const parts = text.split(/(\s+|[\[\]<>?:])/g);

        return parts.map((part, index) => {
            if (circuitNames.includes(part)) {
            return <span key={index} className="keyword" data-type="Keyword" data-desc="A circuits name.">{part}</span>;
            }
            if (gates.some((gate) => validGateCombinations.includes(part))) {
            return <span key={index} className="gate" data-type="Gate" data-desc="A logical gate.">{part}</span>;
            }
            if (operators.includes(part)) {
            return <span key={index} className="operator" data-type="Operator" data-desc="...">{part}</span>;
            }
            if (consts.includes(part)) {
            return <span key={index} className="type" data-type="Constant" data-desc="A constant value.">{part}</span>;
            }
            if (voltagePattern.test(part) || hertzPattern.test(part)) {
            return <span key={index} className="voltage" data-type="Type" data-desc="Hertz, Voltage,...">{part}</span>;
            }
            return part;
        });
    };

    const dismantle = (text) => {
        const boardPattern = /\[board\s+([\s\S]*?)\]/g; // Extracts the board content
        const circuitPattern = /\[(\w+)[\s\S]*?\]/g; // Matches circuit declarations
        const instancePattern = /^\s*(\w+)\s+(\w+)/gm; // Matches instances inside board
        const pinPattern = /([<>])(\w+)/g; // Matches input and output pins
        const assignmentPattern = /(\w+)\.(\w+)\s*<\s*([\w\d]+)/g; // Matches pin assignments
    
        let declaredCircuits = new Map();
        let tree = [];
    
        // Step 1: Extract circuit declarations
        for (let match of text.matchAll(circuitPattern)) {
            let circuitName = match[1]; // Circuit name (e.g., "multiplexer")
            let circuitBody = match[0]; // Full content of the circuit block
    
            let pinMatches = [...circuitBody.matchAll(pinPattern)]; // Extract <d1, >o1, etc.
            let inputs = pinMatches.filter(p => p[1] === "<").map(p => p[2]);
            let outputs = pinMatches.filter(p => p[1] === ">").map(p => p[2]);
    
            declaredCircuits.set(circuitName, { inputs, outputs });
        }
    
        console.log("Declared Circuits:", declaredCircuits);
    
        // Step 2: Extract board contents
        let boardMatch = boardPattern.exec(text);
        if (!boardMatch) {
            console.log("No board found!");
            return;
        }
    
        let boardText = boardMatch[1]; // Get the contents inside [board ...] block
        console.log("Board Content:", boardText);
    
        // Step 3: Match instances inside board
        let instances = new Map();
    
        for (let match of boardText.matchAll(instancePattern)) {
            let circuitType = match[1]; // e.g., "multiplexer"
            let instanceName = match[2]; // e.g., "m"
    
            if (!declaredCircuits.has(circuitType)) {
                console.log(`Circuit type '${circuitType}' not found in declarations.`);
                continue;
            }
    
            let declaredPins = declaredCircuits.get(circuitType);
    
            let instance = {
                name: instanceName,
                circuit: circuitType,
                inputs: declaredPins.inputs.map((pin) => ({ name: pin, value: null })),
                outputs: declaredPins.outputs.map((pin) => ({ name: pin })),
            };
    
            instances.set(instanceName, instance);
        }
    
        // Step 4: Match pin assignments
        for (let match of boardText.matchAll(assignmentPattern)) {
            let instanceName = match[1]; // e.g., "m"
            let pinName = match[2]; // e.g., "clk"
            let value = match[3]; // e.g., "500hz"
    
            if (instances.has(instanceName)) {
                let instance = instances.get(instanceName);
    
                let inputPin = instance.inputs.find((p) => p.name === pinName);
                if (inputPin) {
                    inputPin.value = value;
                }
            }
        }
    
        // Convert Map to array
        tree = Array.from(instances.values());
    
        console.log("Final Tree:", tree);
    
        setTree(tree);
        callback(tree);
    };
    
    useEffect(()=>{
        dismantle(code);
    }, [])

    function escapeRegex(str) {
        return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    }

    return (
        <div className="editor">
            <textarea
                value={code}
                onKeyDown={handleKeyDown}
                onChange={(e) => {setCode(e.target.value); dismantle(e.target.value)}}
            />

            <pre className="highlighted">
                <code>{highlightSyntax(code)}</code>
            </pre>
        </div>
    );
}

export default Editor;


