import { useEffect, useRef, useState } from "react";
import './App.css';
import Draggable from 'react-draggable';

function Clock({circuit, index, updateXarrow,update,updateSchema,schema}){
    const nodeRef = useRef(null);
    const [timer, setTimer] = useState(null);

    useEffect(() => {
        console.log(circuit)
        if (!timer) {
            let hz = circuit.inputs[0].value.replace('hz', '').trim();
            let frequency = parseFloat(hz);
            console.log(frequency)

            if (!isNaN(frequency) && frequency > 0) {
                let interval = 1000 / frequency;

                const newTimer = setInterval(() => {
                    circuit.outputs[0].voltage = circuit.outputs[0].voltage === "H" ? 'L' : 'H';
                    update(circuit)
                }, interval);
                setTimer(newTimer);
            } else {

            }
        }

        return () => {
            if (timer) {
                clearInterval(timer);
                setTimer(null);
            }
        };
    }, [timer, circuit.inputs[0].value]);
    return( 
    <Draggable
        key={`circuit-${index}`}
        onDrag={updateXarrow}
        onStop={(e, data)=>{updateXarrow(); updateSchema(circuit.name, {x: data.x, y:data.y})}}
        nodeRef={nodeRef}
        grid={[20,20]}
        defaultPosition={schema[circuit.name]}
    >
        <span 
        className="built-in-circuit"
        id={`${circuit.name}-out`}
        style={{display: 'flex',justifyContent: 'center', alignItems: 'center',width: 64, height: 64,backgroundColor: circuit.outputs[0].voltage === 'H' ? 'violet': 'grey', 
        borderRadius: '50%', filter:  circuit.outputs[0].voltage === 'H' ? `drop-shadow(0px 0px 10px violet)` : '', textAlign: 'center'}} 
        ref={nodeRef}>{circuit.inputs[0].value}</span>
    </Draggable>)
}

export default Clock;