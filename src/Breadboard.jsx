import React,{ useState,useRef, useEffect } from 'react'
import './App.css';
import Draggable from 'react-draggable';
import Xarrow, {useXarrow, Xwrapper} from 'react-xarrows';
import Circuit from './Circuit';
import Led from './Led';
import Switch from './Switch';

function Breadboard({tree, update}) {
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

  const predefinedCircuits = ["rled", "gled", "bled", "switch", "matrix4x4"]

  useEffect(()=>{
    console.log('Wiring...')
    setConnections(getConnections(tree))
  },[tree])

return (
  <div className="breadboard">
      {tree.map((circuit, index) => (
          <span>
            {circuit.circuit === "rled" && <Led circuit={circuit} index={index} updateXarrow={updateXarrow} color={'#FF7E7E'}/>}
            {circuit.circuit === "gled" && <Led circuit={circuit} index={index} updateXarrow={updateXarrow} color={'#DDF58B'}/>}
            {circuit.circuit === "bled" && <Led circuit={circuit} index={index} updateXarrow={updateXarrow} color={'#7F95EB'}/>}
            {circuit.circuit === "switch" && <Switch circuit={circuit} index={index} updateXarrow={updateXarrow} update={update}/>}
            {!predefinedCircuits.includes(circuit.circuit) && <Circuit circuit={circuit} index={index} updateXarrow={updateXarrow}/>}
          </span>
      ))}

      {connections.map((connection, index) => (
          <span className={connection.lineColor === "violet" ? 'active-wire' : ''}>
            <Xarrow
              key={`connection-${index}`}
              start={connection.start}
              end={connection.end}
              lineColor={connection.lineColor}
              headColor={connection.lineColor}
              headShape={'circle'}
              headSize={4}
              tailColor={connection.lineColor}
              showTail={true}
              tailSize={4}
              tailShape={'circle'}
              labels={{
                middle: `${connection.startPinName} → ${connection.endPinName}`, // Centered label
              }}
              path="grid"
              gridBreak={`${((index+1)/(connections.length+1))*100}%`}
              animateDrawing={0.5}
          />
          </span>
      ))}
  </div>
);
}

export default Breadboard
