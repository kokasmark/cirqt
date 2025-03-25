import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import "./App.css";

const Editor = forwardRef(({ callback }, ref) => {
    const [code, setCode] = useState(`
[board <H <_ 
    led l
    switch s    
    
    s.i < H
    l.p < s.o
]`);

    const circuits = `
    [led <p >o
        o < p
    ]
    [switch <p >o
        o < p
    ]
    [matrix4x4]
    `

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
        const circuitNamePattern = /\[\s*(\w+)/g;
        const hertzPattern = /\b(\d+(\.\d*)?)hz\b/g;

        const validGateCombinations = [
            "&", "|", "!", //Basic
            "!&", //Nand
            "!|",//Nor
            "x|", //Xor
            "x!|", //XNor
        ];

        let circuitNames = [];
        let match;

        while ((match = circuitNamePattern.exec(text+circuits)) !== null) {
            circuitNames.push(match[1]);
        }

        const parts = text.split(/(\s+|[\[\]<>?:])/g);

        return parts.map((part, index) => {
            if (circuitNames.includes(part)) {
            return <span key={index} className="keyword" data-type="Circuit" data-desc="An instace can be created.">{part}</span>;
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
            if (hertzPattern.test(part)) {
                return <span key={index} className="voltage" data-type="Type" data-desc="Hertz, Voltage,...">{part}</span>;
                }
            return part;
        });
    };

    const dismantle = (text) => {
        const boardPattern = /\[board\s+([\s\S]*?)\]/g; 
        const circuitPattern = /\[(\w+)[\s\S]*?\]/g; 
        const instancePattern = /^\s*(\w+)\s+(\w+)/gm; 
        const pinPattern = /([<>])(\w+)/g; 
        const assignmentPattern = /(\w+)\.(\w+)\s*<\s*([\w.]+)/g; 
    
        let declaredCircuits = new Map();
        let tree = [];
        
        text = text + circuits;
        
        for (let match of text.matchAll(circuitPattern)) {
            let circuitName = match[1]; 
            let circuitBody = match[0]; 
        
            let lines = circuitBody.split("\n").slice(1); 
            let logicBody = lines.join("\n").trim(); 
        
            let pinMatches = [...circuitBody.matchAll(pinPattern)]; 
            let inputs = pinMatches.filter(p => p[1] === "<").map(p => p[2]);
            let outputs = pinMatches.filter(p => p[1] === ">").map(p => p[2]);
        
            declaredCircuits.set(circuitName, { inputs, outputs, circuitBody: logicBody });
        }

    
        
        let boardMatch = boardPattern.exec(text);
        if (!boardMatch) {
            return;
        }
    
        let boardText = boardMatch[1]; 
    
        
        let instances = new Map();
    
        for (let match of boardText.matchAll(instancePattern)) {
            let circuitType = match[1]; 
            let instanceName = match[2]; 
    
            if (!declaredCircuits.has(circuitType)) {
                continue;
            }
    
            let declaredPins = declaredCircuits.get(circuitType);
    
            let instance = {
                name: instanceName,
                circuit: circuitType,
                circuitBody: declaredPins.circuitBody, 
                inputs: declaredPins.inputs.map((pin) => ({ name: pin, value: null })),
                outputs: declaredPins.outputs.map((pin) => ({ name: pin })),
            };
    
            instances.set(instanceName, instance);
        }
    
        for (let match of boardText.matchAll(assignmentPattern)) {
            let instanceName = match[1]; 
            let pinName = match[2]; 
            let value = match[3]; 
        
            if (instances.has(instanceName)) {
                let instance = instances.get(instanceName);
        
                let pin = instance.inputs.find((p) => p.name === pinName);
                if (pin) {
                    
                    if (value.includes(".")) {
                        let [connectedInstance, connectedPin] = value.split(".");
                        pin.value = `${connectedInstance}-${connectedPin}`;
                        pin.type = "connection";
                        pin.voltage = "L";
                    } else {
                        pin.value = value;
                        pin.voltage = "L";
                        pin.type = "literal";
                    }
                }
            }
        }
    
        
        tree = Array.from(instances.values());
    
        console.log("Final Tree:", tree);
    
        setTree(tree);
        callback(tree);
    };
    
    
    const parseLogicExpression = (expr) => {
        expr = expr.replace(/\bH\b/g, "true");
        expr = expr.replace(/\bL\b/g, "false");
    
        
        expr = expr.replace(/\s*&\s*/g, " && ");    
        expr = expr.replace(/\s*x\|\s*/g, " !== "); 
        expr = expr.replace(/\s*!&\s*/g, " NAND "); 
        expr = expr.replace(/\s*!\|\s*/g, " NOR ");  
    
        
        expr = expr.replace(/\b([a-zA-Z_]\w*)\b/g, (match) => {
            if (match === "true" || match === "false") return match; 
            return `pins.${match}`;
        });
    
        
        expr = expr.replace(/pins\.(\w+)\s*NAND\s*pins\.(\w+)/g, "!(pins.$1 && pins.$2)");
        expr = expr.replace(/pins\.(\w+)\s*NOR\s*pins\.(\w+)/g, "!(pins.$1 || pins.$2)");
        return expr;
    };
    
    const extractEvaluators = (circuitBody) => {
        const evalPattern = /^\s*(\w+)\s*<\s*([\w\s&!|]+)$/gm; 
        let evaluators = {};
    
        for (let match of circuitBody.matchAll(evalPattern)) {
            let outputPin = match[1].trim(); 
            let expression = match[2].trim(); 
    
            let parsedExpr = parseLogicExpression(expression);
    
            try {
                evaluators[outputPin] = new Function("pins", `return (${parsedExpr});`);
            } catch (error) {
                console.error(`Error creating evaluator for ${outputPin}:`, error);
            }
        }
    
        return evaluators;
    };

    const evaluate = (tree) => {
        let pinValues = new Map(); // Stores pin states during evaluation
        let connectionMap = new Map(); // Stores input-output mappings
    
        // First pass: Initialize known values (literals & outputs)
        tree.forEach(instance => {
            instance.inputs.forEach(pin => {
                if (pin.type === "literal") {
                    pinValues.set(`${instance.name}-${pin.name}`, pin.value === "H");
                }
            });
    
            // Store connections between input and output pins
            instance.outputs.forEach(outputPin => {
                let outputKey = `${instance.name}-${outputPin.name}`;
                pinValues.set(outputKey, outputPin.voltage === "H");
    
                instance.inputs.forEach(inputPin => {
                    if (inputPin.type === "connection") {
                        const [srcInstance, srcPin] = inputPin.value.split("-");
                        let srcKey = `${srcInstance}-${srcPin}`;
    
                        if (!connectionMap.has(srcKey)) {
                            connectionMap.set(srcKey, []);
                        }
                        connectionMap.get(srcKey).push(outputKey);
                    }
                });
            });
        });
    
        let changed = true;
        while (changed) {
            changed = false;
    
            tree.forEach(instance => {
                let evaluators = extractEvaluators(instance.circuitBody);
    
                instance.outputs.forEach(outputPin => {
                    let outputKey = `${instance.name}-${outputPin.name}`;
                    let inputs = {}; 
    
                    instance.inputs.forEach(pin => {
                        let inputKey = `${instance.name}-${pin.name}`;
    
                        if (pin.type === "connection") {
                            const [srcInstance, srcPin] = pin.value.split("-");
                            let srcKey = `${srcInstance}-${srcPin}`;
                            inputs[pin.name] = pinValues.get(srcKey) ?? false;
                        } else {
                            inputs[pin.name] = pinValues.get(inputKey) ?? false;
                        }
                    });
    
                    // Evaluate logic expression if present
                    if (evaluators[outputPin.name]) {
                        let newValue = evaluators[outputPin.name](inputs);
                        if (pinValues.get(outputKey) !== newValue) {
                            pinValues.set(outputKey, newValue);
                            outputPin.voltage = newValue ? 'H' : 'L';
                            changed = true;
                        }
                    }
                });
            });
    
            // ✅ Propagate values through direct connections
            pinValues.forEach((value, pinKey) => {
                if (connectionMap.has(pinKey)) {
                    connectionMap.get(pinKey).forEach(destKey => {
                        if (pinValues.get(destKey) !== value) {
                            pinValues.set(destKey, value);
                            changed = true;
                        }
                    });
                }
            });
        }
    
        // Final pass: Apply resolved values to actual tree
        tree.forEach(instance => {
            instance.outputs.forEach(outputPin => {
                let pinKey = `${instance.name}-${outputPin.name}`;
                if (pinValues.has(pinKey)) {
                    outputPin.voltage = pinValues.get(pinKey) ? 'H' : 'L';
                }
            });
    
            instance.inputs.forEach(inputPin => {
                if (inputPin.type === "connection") {
                    const [srcInstance, srcPin] = inputPin.value.split("-");
                    let srcKey = `${srcInstance}-${srcPin}`;
                    if (pinValues.has(srcKey)) {
                        inputPin.voltage = pinValues.get(srcKey) ? 'H' : 'L';
                    }
                }
            });
        });
    
        console.log("Evaluation Complete:", tree);
        return pinValues;
    };
    
    
    useEffect(() => {
        evaluate(tree);
    }, [tree]);


    useEffect(()=>{
        dismantle(code);
    }, [])

    useImperativeHandle(ref, () => ({
        evaluate
    }));


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
});

export default Editor;


