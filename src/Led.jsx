import { useRef } from "react";
import './App.css';
import Draggable from 'react-draggable';

function Led({circuit, index, updateXarrow}){
    const nodeRef = useRef(null);

    return( 
    <Draggable
        key={`circuit-${index}`}
        onDrag={updateXarrow}
        onStop={updateXarrow}
        nodeRef={nodeRef}
    >
    <span 
    id={`${circuit.name}-p`}
    style={{display: 'block',width: 50, height: 50,backgroundColor: circuit.outputs[0].voltage === 'H' ? 'red': 'grey', 
    borderRadius: '50%'}} ref={nodeRef}></span>
    </Draggable>)
}

export default Led;