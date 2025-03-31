import { useRef } from "react";
import './App.css';
import Draggable from 'react-draggable';

function SevenSegment({ circuit, index, updateXarrow, color, updateSchema, schema }) {
    const nodeRef = useRef(null);
    const segments = [
        { id: 0, style: { gridColumn: '2', gridRow: '1', width: 40, height: 10 } },  // Top
        { id: 1, style: { gridColumn: '3', gridRow: '2', width: 10, height: 40 } },  // Top-right
        { id: 2, style: { gridColumn: '3', gridRow: '4', width: 10, height: 40 } },  // Bottom-right
        { id: 3, style: { gridColumn: '2', gridRow: '5', width: 40, height: 10 } },  // Bottom
        { id: 4, style: { gridColumn: '1', gridRow: '4', width: 10, height: 40 } },  // Bottom-left
        { id: 5, style: { gridColumn: '1', gridRow: '2', width: 10, height: 40 } },  // Top-left
        { id: 6, style: { gridColumn: '2', gridRow: '3', width: 40, height: 10 } }   // Middle
    ];
    return (
        <Draggable key={`circuit-${index}`} onDrag={updateXarrow} onStop={(e, data) => { updateXarrow(); updateSchema(circuit.name, { x: data.x, y: data.y }) }} nodeRef={nodeRef} grid={[20, 20]} defaultPosition={schema[circuit.name]}>
            <span className="built-in-circuit" id= {`${circuit.name}-clk`} style={{
                display: 'grid',
                gridTemplateColumns: '10px 40px 10px',
                gridTemplateRows: '10px 40px 10px 40px 10px',
                background: '#242424',
                padding: 5,
                gap: 2,
            }} ref={nodeRef}>
                {segments.map(seg => {
                    const isActive = seg.id < circuit.inputs.length ? circuit.inputs[seg.id].voltage === 'H' : false;
                    return (
                        <span
                            id=""
                            key={seg.id}
                            style={{
                                ...seg.style,
                                backgroundColor: isActive ? color : '#333',
                                filter: isActive ? `drop-shadow(0px 0px 5px ${color})` : '',
                                borderRadius: 2
                            }}
                        />
                    );
                })}
            </span>
        </Draggable>
    );
}


export default SevenSegment;