import { useRef } from "react";
import './App.css';
import Draggable from 'react-draggable';

function Led({circuit, index, updateXarrow, color}){
    const nodeRef = useRef(null);

    return( 
    <Draggable
        key={`circuit-${index}`}
        onDrag={updateXarrow}
        onStop={updateXarrow}
        nodeRef={nodeRef}
        grid={[20,20]}
    >
        <span 
        className="built-in-circuit"
        id={`${circuit.name}-in`}
        style={{display: 'block',width: 50, height: 50,backgroundColor: circuit.outputs[0].voltage === 'H' ? color: 'grey', 
        borderRadius: '50%', filter:  circuit.outputs[0].voltage === 'H' ? `drop-shadow(0px 0px 10px ${color})` : '',transition: 'background 1s, filter 1s'}} ref={nodeRef}></span>
    </Draggable>)
}

export default Led;