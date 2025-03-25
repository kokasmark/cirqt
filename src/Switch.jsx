import { useRef } from "react";
import './App.css';
import Draggable from 'react-draggable';

function Switch({circuit, index, updateXarrow,update}){
    const nodeRef = useRef(null);

    return( 
    <Draggable
        key={`circuit-${index}`}
        onDrag={updateXarrow}
        onStop={updateXarrow}
        nodeRef={nodeRef}
    >
    <span 
    id={`${circuit.name}-o`}
    style={{display: 'block',width: 25, height: 50,backgroundColor: circuit.inputs[0].voltage === 'H' ? 'red': 'grey', 
    borderRadius: 10}} ref={nodeRef} onClick={()=>{circuit.inputs[0].voltage === 'H' ? circuit.inputs[0].voltage = 'L' : circuit.inputs[0].voltage = 'H'; update(circuit)}}/>
    </Draggable>)
}

export default Switch;