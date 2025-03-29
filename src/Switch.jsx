import { useRef } from "react";
import './App.css';
import Draggable from 'react-draggable';

function Switch({circuit, index, updateXarrow,update,updateSchema,schema}){
    const nodeRef = useRef(null);

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
    style={{display: 'block', width: 25, height: 50, backgroundColor: circuit.inputs[0].voltage === 'H' ? 'grey' : '#242424', border: '2px solid black', borderRadius: '5px', position: 'relative', cursor: 'pointer', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.3)'}}
    ref={nodeRef} 
    onClick={()=>{circuit.inputs[0].voltage === "H"? circuit.inputs[0].voltage = 'L' : circuit.inputs[0].voltage = 'H'; update(circuit)}} 
    />

    </Draggable>)
}

export default Switch;