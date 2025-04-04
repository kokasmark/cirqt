import React,{useRef} from 'react'
import './App.css';
import Draggable from 'react-draggable';

function Circuit({circuit, index, updateXarrow,updateSchema,schema}){
    const nodeRef = useRef(null);
    return (
        <Draggable
              key={`circuit-${index}`}
              onDrag={updateXarrow}
              onStop={(e, data)=>{updateXarrow(); updateSchema(circuit.name, {x: data.x, y:data.y})}}
              nodeRef={nodeRef}
              grid={[20,20]}
              defaultPosition={schema[circuit.name]}
          >
              <div className="circuit-container" id={`circuit-${index}`} ref={nodeRef}>
                  <span className="pins">
                      {circuit.inputs?.map((pin, index) => (
                          <span className='pin' key={`${circuit.name}-${pin.name}`}>
                              <span style={{ width: 5, height: 20, background: pin.voltage === "H" ? 'violet':'white', display: 'block', position: 'absolute', top: -10 }} 
                              id={`${circuit.name}-${pin.name}`} ></span>
                          </span>
                      ))}
                  </span>

                  <div className="circuit">
                      <p>{circuit.name} - {circuit.circuit}</p>
                  </div>

                  <span className="pins">
                      {circuit.outputs?.map((pin, index) => (
                          <span className='pin' key={`${circuit.name}-${pin.name}`}>
                              <span style={{ width: 5, height: 20, background: pin.voltage === "H" ? 'violet':'white', display: 'block', position: 'absolute', top: 60 }} 
                              id={`${circuit.name}-${pin.name}`}></span>
                          </span>
                      ))}
                  </span>
              </div>
          </Draggable>
    );
}

export default Circuit