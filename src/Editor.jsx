import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import "./App.css";

const Editor = forwardRef(({ callback }, ref) => {
    const [code, setCode] = useState(`
[a <i1 <i2 >o1
    o1 < i1 & i2
]
[b <i1 <i2 >o1
    o1 < i1 | i2
]
[board <H <_ 
    a aa
    b bb
    led l
    switch s    
    
    aa.i1 < H
    aa.i2 < s.out

    bb.i1 < aa.o1
    bb.i2 < L

    l.in < bb.o1
]`);

    const circuits = `
    [led <in >out
        out < in
    ]
    [switch <in >out
        out < in
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
                inputs: declaredPins.inputs.map((pin) => ({ name: pin, value: null, voltage: 'L' })),
                outputs: declaredPins.outputs.map((pin) => ({ name: pin, value: null, voltage: 'L' })),
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
                        pin.voltage = value;
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
                evaluators[outputPin] = new Function("pins", `return (${parsedExpr}) ? 'H' : 'L';`);
            } catch (error) {
                console.error(`Error creating evaluator for ${outputPin}:`, error);
            }
        }
    
        return evaluators;
    };

    const evaluate = (tree) => {
        let pinValues = {};
        let connections = {};
        let change = true;

        //Connect up pins
        tree.forEach(instance => {
            instance.inputs.forEach(pin => {
                pinValues[`${instance.name}-${pin.name}`] = pin.voltage;

                if(pin.type === "connection"){
                    connections[`${instance.name}-${pin.name}`] = pin.value;
                }
            });
            instance.outputs.forEach(pin => {
                pinValues[`${instance.name}-${pin.name}`] = 'L';
            });
        });

        //Evaluate
        let cycles = 0;
        while(change){
            change = false;
            tree.forEach(instance => {
                const evaluators = extractEvaluators(instance.circuitBody);
                instance.outputs.forEach(pin => {
                    let evalPin = evaluators[pin.name];
                    let pins = instance.inputs.reduce((acc, pin) => ({ ...acc, [pin.name]: pin.voltage === "H"}), {});
                    let voltage = evalPin(pins);
                    
                    if(pinValues[`${instance.name}-${pin.name}`] !== voltage || pin.voltage !== voltage){
                        change = true;
                        console.log(`${instance.name}-${pin.name} ${pin.voltage} => ${voltage}`)    
                        pin.voltage = voltage;
                        pinValues[`${instance.name}-${pin.name}`] = voltage;
                    }
                });

                instance.inputs.forEach(pin => {
                    let voltage = pinValues[connections[`${instance.name}-${pin.name}`]];
                    if(pin.voltage !== voltage && voltage){
                        change = true;
                        console.log(`${instance.name}-${pin.name} ${pin.voltage} => ${voltage}`)    
                        pin.voltage = voltage;
                        pinValues[`${instance.name}-${pin.name}`] = voltage;
                    }
                });
            });
            cycles++;
        }
        
        console.log(`Propagated in ${cycles} cycles!`)

        //Propagate value
        tree.forEach(instance => {
            instance.inputs.forEach(pin => {
                if(connections[`${instance.name}-${pin.name}`]){
                    pin.voltage = pinValues[connections[`${instance.name}-${pin.name}`]]
                }
            });
        });
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


