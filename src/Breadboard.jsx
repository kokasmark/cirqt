import React,{ useState,useRef, useEffect } from 'react'
import './App.css';
import Draggable from 'react-draggable';
import Xarrow, {useXarrow, Xwrapper} from 'react-xarrows';

function Breadboard({tree}) {
  const updateXarrow = useXarrow();
  const nodeRefs = useRef([]);
  if (nodeRefs.current.length !== tree.length) {
    nodeRefs.current = tree.map(() => React.createRef());
  }


  const getConnections = (tree) => {
    let connections = [];

    tree.forEach((circuit) => {
        circuit.outputs?.forEach((outputPin) => {
            tree.forEach((targetCircuit) => {
                if (targetCircuit !== circuit) {
                    targetCircuit.inputs?.forEach((inputPin) => {
                        if (inputPin.value === `${circuit.name}-${outputPin.name}`) {
                            connections.push({
                                start: `${circuit.name}-${outputPin.name}`,
                                end: `${targetCircuit.name}-${inputPin.name}`,
                                lineColor: outputPin.voltage === "H" ? 'violet' : 'grey',
                                startPinName: outputPin.name,
                                endPinName: inputPin.name
                            });
                        }
                    });
                }
            });
        });
    });
    return connections;
  };

const [connections,setConnections] = useState(getConnections(tree));

useEffect(()=>{
  setConnections(getConnections(tree))
},[tree])

return (
  <div className="breadboard">
      {tree.map((circuit, index) => (
          <Draggable
              key={`circuit-${index}`}
              onDrag={updateXarrow}
              onStop={updateXarrow}
              nodeRef={nodeRefs.current[index]}
          >
              <div className="circuit-container" id={`circuit-${index}`} ref={nodeRefs.current[index]}>
                  <span className="pins">
                      {circuit.inputs?.map((pin, index) => (
                          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} key={`${circuit.name}-${pin.name}`}>
                              {(pin.value && pin.type === "literal") && <p style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>{pin.name} <span style={{ color: 'violet' }}>{pin.value ? pin.value : 'None'}</span></p>}
                              <span style={{ width: 5, height: 20, background: pin.voltage === "H" ? 'violet':'white', display: 'block', position: 'absolute', top: 55 }} id={`${circuit.name}-${pin.name}`} ></span>
                          </span>
                      ))}
                  </span>

                  <div className="circuit">
                      <p>{circuit.name} - {circuit.circuit}</p>
                  </div>

                  <span className="pins">
                      {circuit.outputs?.map((pin, index) => (
                          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} key={`${circuit.name}-${pin.name}`}>
                              <span style={{ width: 5, height: 20, background: pin.voltage === "H" ? 'violet':'white', display: 'block', position: 'absolute', top: 125 }} id={`${circuit.name}-${pin.name}`}></span>
                          </span>
                      ))}
                  </span>
              </div>
          </Draggable>
      ))}

      {connections.map((connection, index) => (
          <Xarrow
              key={`connection-${index}`}
              start={connection.start}
              end={connection.end}
              lineColor={connection.lineColor}
              headColor={'white'}
              headShape={'circle'}
              headSize={4}
              tailColor={'white'}
              showTail={true}
              tailSize={4}
              tailShape={'circle'}
              labels={{ start: connection.startPinName, end: connection.endPinName }}
              path="grid"
              gridBreak={`${(index/connections.length)*100}%`}
          />
      ))}
  </div>
);
}

export default Breadboard
