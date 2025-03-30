import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import "./App.css";
import { Bounce, ToastContainer, toast } from 'react-toastify';


let lastEvaluation = 0;

const Editor = forwardRef(({ callback, files, setCode, setStats,addFile,setCurrent,current, appConfig }, ref) => {
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

    const success = (msg) => {
        toast.success(msg, {
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
        "keyword_.include": 'Includes a file˙s circuits.'
    }

    const handleKeyDown = (event) => {
        if (event.key === "Tab") {
          event.preventDefault();

          const cursorPosition = event.target.selectionStart;
          const newCode =  files[current].code.slice(0, cursorPosition) + "    " +  files[current].code.slice(cursorPosition);
  
          setCode(current,newCode);

          setTimeout(() => {
            event.target.selectionStart = cursorPosition + 4;
            event.target.selectionEnd = cursorPosition + 4;
          }, 0);
        }
    };

    const handleAddFile = () =>{
        addFile('New Board')
        success('New board created!')
    }

    

    const highlightSyntax = (text) => {
        const circuitNamePattern = /\[\s*(\w+)/g;
        const hertzPattern = /\b(\d+(\.\d*)?)hz\b/g;
        const variablePattern = /\w+\.(\w+)/;
        const bitArrayPattern = /b(0|1)+/;
        const commentPattern = /#.*/g; 
    
        let circuitNames = [];
        let match;
    
        while ((match = circuitNamePattern.exec(text + circuits)) !== null) {
            circuitNames.push(match[1]);
        }
    
        const parts = text.split(/(#[^\n]*|\s+|[\[\]<>?:])/g);
        let line = 0;
    
        return parts.map((part, index) => {
            if(part.includes('\n')){
                line++;
            }
            if (commentPattern.test(part)) {
                return <span key={index} id={`line-${line}`} className="comment" data-type="Comment" data-desc="Just notes..." style={{color: appConfig['commentColor']}}>{part}</span>;
            }
            if (circuitNames.includes(part)) {
                return <span key={index} id={`line-${line}`} className="keyword" data-type="Circuit" data-desc={help[`keyword_${part}`]} style={{color: appConfig['keywordColor']}}>{part}</span>;
            }
            if (gates.some((gate) => validGateCombinations.includes(part))) {
                return <span key={index} id={`line-${line}`} className="gate" data-type="Gate" data-desc="A logical gate." style={{color: appConfig['gateColor']}}>{part}</span>;
            }
            if (operators.includes(part)) {
                return <span key={index} id={`line-${line}`} className="operator" data-type="Operator" data-desc="..." style={{color: appConfig['operatorColor']}}>{part}</span>;
            }
            if (consts.includes(part)) {
                return <span key={index} id={`line-${line}`} className="type" data-type="Constant" data-desc="A constant value." style={{color: appConfig['typeColor']}}>{part}</span>;
            }
            if (hertzPattern.test(part)) {
                return <span key={index} id={`line-${line}`} className="type" data-type="Type" data-desc="..." style={{color: appConfig['typeColor']}}>{part}</span>;
            }
            if (variablePattern.test(part)) {
                return <span key={index} id={`line-${line}`} className="pin" data-type="Pin" data-desc="A circuit instance's pin." style={{color: appConfig['pinColor']}}>{part}</span>;
            }
            if (bitArrayPattern.test(part)) {
                return <span key={index} id={`line-${line}`} className="type" data-type="Bits" data-desc="A sequence of bits." style={{color: appConfig['typeColor']}}>{part}</span>;
            }
            
            if(part.includes(".include")){
                return <span key={index} id={`line-${line}`} className="keyword" data-type="File" data-desc={help[`keyword_${part}`]}>{part}</span>;
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
        const includePattern = /\.include\s+(\S+)/g; 
    
        let declaredCircuits = new Map();
        let tree = [];

        let includeMatch;
        while ((includeMatch = includePattern.exec(text)) !== null) {
            const fileName = includeMatch[1];
            const file = files.find(f => f.title === fileName);
            
            if (file) {
                text += `\n${file.code.replace(boardPattern.exec(file.code),'')}`;
            } else {
                error(`No file can be found: ${fileName}.cqt`);
            }
        }
        
        text = text.replace(/#.*/g,'')
        
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
                step: 0
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
                        pin.steps = 0;
                    } else {
                        pin.value = value;
                        pin.voltage = value;
                        pin.type = "literal";
                        pin.steps = 0;
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
            return `pins.${match}`; 
        });

        expr = expr.replace(/!\(\s*([\w\s&|!]+)\s*\)/g, "!( $1 )"); 

        expr = expr.replace(/\(([\w\s&|!()]+)\)/g, "($1)");
   
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

    let lastEvaluationCycleCount = 0;
    let lastEvaluationUpdates = 0
    const evaluate = (tree) => {
        let pinValues = {};
        let connections = {};
        let change = true;
        const bitArray = /b(0|1)+/;

        calculateStatistics(()=>{
            //Connect up pins
            tree.forEach(instance => {
                instance.inputs.forEach(pin => {
                    pinValues[`${instance.name}-${pin.name}`] = pin.voltage;

                    if(pin.type === "connection"){
                        connections[`${instance.name}-${pin.name}`] = pin.value;
                    }
                    else if(bitArray.test(pin.value)){
                        let bits = pin.value.slice(1)
                        let voltage = bits[instance.step % bits.length] === '1' ? 'H' : 'L';
                        pinValues[`${instance.name}-${pin.name}`] = voltage;
                        pin.voltage = voltage;

                    }
                });
                instance.outputs.forEach(pin => {
                    pinValues[`${instance.name}-${pin.name}`] = pin.voltage;
                });
            });

            let updatedInstances = {};
            //Evaluate
            let cycles = 0;
            while(change){
                if(cycles > appConfig['maxCycleCount']){
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
                                pin.step = (pin.step + 1) % 64
                                pinValues[`${instance.name}-${pin.name}`] = voltage;
                                updatedInstances[instance.name] = 1;
                                return;
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
                            pin.step = (pin.step + 1) % 64
                            pinValues[`${instance.name}-${pin.name}`] = voltage;
                            updatedInstances[instance.name] = 1;
                            return;
                        }
                    });
                    if(change)
                        instance.step = (instance.step + 1) % appConfig['maxUpdateCount'];
                });
                cycles++;
            }
            lastEvaluationCycleCount = cycles;
            lastEvaluationUpdates = Object.keys(updatedInstances).length;
            console.log(`Propagated in ${cycles} cycles!`)

            //Propagate value
            tree.forEach(instance => {
                instance.inputs.forEach(pin => {
                    if(connections[`${instance.name}-${pin.name}`]){
                        pin.voltage = pinValues[connections[`${instance.name}-${pin.name}`]]
                    }
                });
            });
        });
    };
    
    const calculateStatistics = (action) => {
        const start = performance.now(); 
        const waitedFor = start - lastEvaluation;

        action();

        lastEvaluation = performance.now();

        const end = performance.now(); 
        const evaluationTime = end - start;
        

        setStats({
            cycles: lastEvaluationCycleCount,
            updatedInstances: lastEvaluationUpdates,
            allInstances: tree.length,
            evaluationMs: evaluationTime.toFixed(2),
            evaluationWait: waitedFor.toFixed(2)
        });
    }
    
    useEffect(() => {
        calculateStatistics(()=>evaluate(tree));
    }, [tree]);
    

    useEffect(()=>{
        dismantle(files[current]? files[current].code : '');
    }, [current])

    useImperativeHandle(ref, () => ({
        evaluate
    }));



    return (
        <div className="editor"
        id="editor"
            onPointerEnter={() => {
                if (appConfig['animateBackground']) {
                    document.getElementById("app").style.setProperty('--left-side-percent', '120%');
                    document.getElementById("app").style.setProperty('--right-side-percent', '40%');
                }
            }}
            onPointerLeave={()=>() => {
                if (appConfig['animateBackground']) {
                    document.getElementById("app").style.setProperty('--left-side-percent', '60%');
                    document.getElementById("app").style.setProperty('--right-side-percent', '60%');
                }
            }}
            >
            <div className="files">
                {files.map((file, index) => (
                    <span onClick={()=>setCurrent(index)} style={{filter: index === current ? '' : 'brightness(0.5)'}}>
                        <span style={{display: 'block', width: 10, height: 10, background: 'white', borderRadius: '50%'}}></span>
                        <p>{file.title}.cqt</p>
                    </span>
                ))}

                <span onClick={()=>handleAddFile()}>
                    <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: 10, height: 10, border: '1px solid white', borderRadius: '50%'}}></span>
                    <p>New Board</p>
                </span>
            </div>
            <textarea
                value={files[current]? files[current].code : ''}
                onKeyDown={handleKeyDown}
                onChange={(e) => {setCode(current,e.target.value); dismantle(e.target.value)}}
            />

            <pre className="highlighted">
                <code>{highlightSyntax(files[current]? files[current].code : '')}</code>
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


