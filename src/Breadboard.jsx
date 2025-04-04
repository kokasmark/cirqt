import React,{ useState,useRef, useEffect } from 'react'
import './App.css';
import Xarrow, {useXarrow, Xwrapper} from 'react-xarrows';
import Circuit from './Circuit';
import Led from './Led';
import Switch from './Switch';
import Clock from './Clock';

import { GrPowerCycle } from "react-icons/gr";
import { FaMicrochip } from "react-icons/fa";
import { RiTimerLine } from "react-icons/ri";
import { RiRestTimeLine } from "react-icons/ri";
import SevenSegment from './7Segment';

function Breadboard({tree, update, stats, updateSchema,schema,appConfig}) {
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

  const predefinedCircuits = ["rled", "gled", "bled", "switch", "matrix4x4", "clock","sevensegment"]

  useEffect(()=>{
    console.log('Wiring...')
    setConnections(getConnections(tree))
  },[tree])

return (
  <div className="breadboard"
  id='breadboard'
  onPointerEnter={() => {
    if (appConfig['animateBackground']) {
        document.getElementById("app").style.setProperty('--left-side-percent', '40%');
        document.getElementById("app").style.setProperty('--right-side-percent', '120%');
    }
}}
onPointerLeave={()=>() => {
    if (appConfig['animateBackground']) {
        document.getElementById("app").style.setProperty('--left-side-percent', '60%');
        document.getElementById("app").style.setProperty('--right-side-percent', '60%');
    }
}}
    >
      <div className="stats">
        <span data-type="Cycles" data-desc="The last evaluation took this many cycles.">
          <GrPowerCycle fontSize={20}/>
          <p>{stats.cycles}</p>
        </span>
        <span data-type="Wait" data-desc="The time between evaluations.">
          <RiRestTimeLine  fontSize={20}/>
          <p>{stats.evaluationWait}ms</p>
        </span>
        <span data-type="Duration" data-desc="The last evaluation took this many milliseconds.">
          <RiTimerLine fontSize={20}/>
          <p>{stats.evaluationMs}ms</p>
        </span>
        <span data-type="Active Circuits" data-desc="The last evaluation updated this many circuits.">
          <FaMicrochip fontSize={20}/>
          <p>{stats.updatedInstances} / {stats.allInstances}</p>
        </span> 
      </div>

      {tree.map((circuit, index) => (
          <span>
            {circuit.circuit === "rled" && <Led circuit={circuit} index={index} updateXarrow={updateXarrow} color={'#FF7E7E'}  updateSchema={updateSchema} schema={schema}/>}
            {circuit.circuit === "gled" && <Led circuit={circuit} index={index} updateXarrow={updateXarrow} color={'#DDF58B'}  updateSchema={updateSchema} schema={schema}/>}
            {circuit.circuit === "bled" && <Led circuit={circuit} index={index} updateXarrow={updateXarrow} color={'#7F95EB'}  updateSchema={updateSchema} schema={schema}/>}
            {circuit.circuit === "switch" && <Switch circuit={circuit} index={index} updateXarrow={updateXarrow} update={update}  updateSchema={updateSchema} schema={schema}/>}
            {circuit.circuit === "clock" && <Clock circuit={circuit} index={index} updateXarrow={updateXarrow} update={update}  updateSchema={updateSchema} schema={schema}/>}
            {circuit.circuit === "sevensegment" && <SevenSegment circuit={circuit} index={index} updateXarrow={updateXarrow} color={'#7F95EB'}  updateSchema={updateSchema} schema={schema}/>}
            {!predefinedCircuits.includes(circuit.circuit) && <Circuit circuit={circuit} index={index} updateXarrow={updateXarrow} updateSchema={updateSchema} schema={schema}/>}
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
              animateDrawing={0.5}
          />
          </span>
      ))}
  </div>
);
}

export default Breadboard
