import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import "./App.css";
import { Bounce, ToastContainer, toast } from 'react-toastify';

const Editor = forwardRef(({ callback }, ref) => {
    const [code, setCode] = useState(`
[a <clk >o1 >o2
    o1 < clk
    o2 < ! clk
]
[board <H <_ 
    a aa
    rled l
    gled g
    clock c
    
    c.hz < 1hz
    aa.clk < c.out
    
    l.in < aa.o1
    g.in < aa.o2
]`);

    const circuits = `
    [rled <in >out
        out < in
    ]
    [gled <in >out
        out < in
    ]
    [bled <in >out
        out < in
    ]
    [switch <in >out
        out < in
    ]
    [matrix4x4]
    [clock <hz >out
        
    ]
    [and <a <b >out
        out < a & b
    ]
    [nand <a <b >out
        out < a !& b
    ]
    [or <a <b >out
        out < a | b
    ]
    [nor <a <b >out
        out < a !| b
    ]
    [xor <a <b >out
        out < a x| b
    ]
    [xnor <a <b >out
        out < a x!| b
    ]
    [not <in >out
        out < ! in
    ]
    [sr_latch <S <R >Q >QN
        Q < ! (R | QN)
        QN < ! (S | Q)
    ]
    `

    const [tree, setTree] = useState([]);

    const operators = ["<", ">", "?", ":", "[", "]"];
    const gates = ["&", "|", "!", "x"];
    const consts = ["_","H","L"];

    const validGateCombinations = [
        "&", "|", "!", //Basic
        "!&", //Nand
        "!|",//Nor
        "x|", //Xor
        "x!|", //XNor
    ];

    const error = (msg) => {
        toast.error(msg, {
            position: "bottom-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
            });
    }

    const help = {
        "keyword_and": 'AND Gate on board, <a <b >out',
        "keyword_or": 'OR Gate on board, <a <b >out',
        "keyword_not": 'NOT Gate on board, <in >out',
        "keyword_rled": 'A red led, <in >out',
        "keyword_gled": 'A green led, <in >out',
        "keyword_bled": 'A blue led, <in >out',
        "keyword_clock": 'A clock that oscillates based on the hz input, <hz >out',
    }

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
        const fieldPattern = /^\w+\.(\w+)$/;

        let circuitNames = [];
        let match;

        while ((match = circuitNamePattern.exec(text+circuits)) !== null) {
            circuitNames.push(match[1]);
        }

        const parts = text.split(/(\s+|[\[\]<>?:])/g);

        return parts.map((part, index) => {
            if (circuitNames.includes(part)) {
                return <span key={index} className="keyword" data-type="Circuit" data-desc={help[`keyword_${part}`]}>{part}</span>;
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
                return <span key={index} className="voltage" data-type="Type" data-desc="...">{part}</span>;
            }
            if (fieldPattern.test(part)) {
                return <span key={index} className="pin" data-type="Pin" data-desc="A circuit instance's pin.">{part}</span>;
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
            error(`Board was not declared!`)
            return;
        }
    
        let boardText = boardMatch[1]; 
    
        
        let instances = new Map();
    
        for (let match of boardText.matchAll(instancePattern)) {
            let circuitType = match[1]; 
            let instanceName = match[2]; 
    
            if (!declaredCircuits.has(circuitType)) {
                error(`No circuit can be find of type ${circuitType}`)
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
        // Step 1: Replace H and L with boolean values
        expr = expr.replace(/\bH\b/g, "true");
        expr = expr.replace(/\bL\b/g, "false");
    
        // Step 2: Replace logical gates with their corresponding JavaScript operators
        expr = expr.replace(/\s*x!\|\s*/g, " === ");  // XNOR
        expr = expr.replace(/\s*x\|\s*/g, " !== ");   // XOR
        expr = expr.replace(/\s*!&\s*/g, " !( ");     // NAND (start)
        expr = expr.replace(/\s*!\|\s*/g, " !( ");    // NOR (start)
        expr = expr.replace(/\s*&\s*/g, " && ");      // AND
        expr = expr.replace(/\s*\|\s*/g, " || ");     // OR
        expr = expr.replace(/\s*!\s*/g, " !");        // NOT
    
        // Step 3: Replace pin names with `pins.` notation (after gate replacement)
        expr = expr.replace(/\b([a-zA-Z_]\w*)\b/g, (match) => {
            if (["XNOR", "XOR", "NAND", "NOR", "AND", "OR", "NOT", "true", "false"].includes(match)) return match;
            return `pins.${match}`;  // Only replace pin names with `pins.` notation
        });
    
        // Step 4: Close NAND and NOR expressions properly
        expr = expr.replace(/!\(\s*([\w\s&|!]+)\s*\)/g, "!( $1 )");  // Fix opening and closing for NAND/NOR
    
        // Step 5: Ensure parentheses are properly placed for composite expressions
        expr = expr.replace(/\(([\w\s&|!()]+)\)/g, "($1)");  // Wrap inside parentheses
    
        // Step 6: Replace gates with JavaScript equivalent operators
        expr = expr.replace(/pins\.(\w+)\s*AND\s*pins\.(\w+)/g, "(pins.$1 && pins.$2)");
        expr = expr.replace(/pins\.(\w+)\s*OR\s*pins\.(\w+)/g, "(pins.$1 || pins.$2)");
        expr = expr.replace(/pins\.(\w+)\s*NOT\s*pins\.(\w+)/g, "!(pins.$1 && pins.$2)");
    
        return expr;
    };
    
    
    
    const extractEvaluators = (circuitBody) => {
        const evalPattern = /^\s*(\w+)\s*<\s*(.+)$/gm;
        let evaluators = {};
    
        for (let match of circuitBody.matchAll(evalPattern)) {
            let outputPin = match[1].trim(); 
            let expression = match[2].trim(); 
    
            let parsedExpr = parseLogicExpression(expression);
            
            try {
                evaluators[outputPin] = new Function("pins", `return (${parsedExpr}) ? 'H' : 'L';`);
            } catch (error) {
                error(`Cannot evaluate ${outputPin}!`)
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
                pinValues[`${instance.name}-${pin.name}`] = pin.voltage;
            });
        });

        //Evaluate
        let cycles = 0;
        while(change){
            if(cycles > 100){
                error("Evaluation timed out!")
                break;
            }
            change = false;
            tree.forEach(instance => {
                const evaluators = extractEvaluators(instance.circuitBody);
                instance.outputs.forEach(pin => {
                    let evalPin = evaluators[pin.name];
                    let pins = instance.inputs.reduce((acc, pin) => ({ ...acc, [pin.name]: pin.voltage === "H"}), {});
                    try{
                        let voltage = evalPin(pins);
                        if(pinValues[`${instance.name}-${pin.name}`] !== voltage || pin.voltage !== voltage){
                            change = true;
                            console.log(`${instance.name}-${pin.name} ${pin.voltage} => ${voltage}`)    
                            pin.voltage = voltage;
                            pinValues[`${instance.name}-${pin.name}`] = voltage;
                        }
                    }catch{

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

            <ToastContainer
                position="bottom-center"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                transition={Bounce}
                />
        </div>
    );
});

export default Editor;


