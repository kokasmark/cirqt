import React,{ useState,useRef } from 'react'
import './App.css';
import Draggable from 'react-draggable';
import Xarrow, {useXarrow, Xwrapper} from 'react-xarrows';

function Breadboard({tree}) {
  const updateXarrow = useXarrow();
  const nodeRefs = useRef([]);
  if (nodeRefs.current.length !== tree.length) {
    nodeRefs.current = tree.map(() => React.createRef());
  }
  
  console.log(nodeRefs)
  return (
    <div className='breadboard'>

      {tree.map((circuit, index)=>(
            <Draggable  key={`circuit-${index}`} onDrag={updateXarrow} onStop={updateXarrow} nodeRef={nodeRefs.current[index]}>
            <div className='circuit-container' id={`circuit-${index}`} ref={nodeRefs.current[index]}>
              <span className='pins'>
                {circuit.inputs?.map((pin, index) => (
                  <span style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}} key={`${circuit.name}-${pin.name}`}>
                     {(pin.value && pin.type === "literal") && <p style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>{pin.name} <span style={{color: 'violet'}}>{pin.value ? pin.value : 'None'}</span></p>}
                    <span style={{width: 5, height: 20, background: 'white',display: 'block', position: 'absolute',top: 55}}  id={`${circuit.name}-${pin.name}`} ></span>
                    {(pin.value && pin.type === "connection" && (document.getElementById(`${circuit.name}-${pin.name}`) && document.getElementById(`${pin.value}`))) && <Xarrow
                      start={`${circuit.name}-${pin.name}`}
                      end={`${pin.value}`}
                      lineColor={pin.voltage === "H"? 'violet':'grey'}
                      headColor={'white'}
                      headShape={'circle'}
                      headSize={4}
                      tailColor={'white'}
                      showTail={true}
                      tailSize={4}
                      tailShape={'circle'}
                      labels={{start: pin.name, end: pin.value}}
                      path='grid'
                  />}
                  </span>
                ))}
              </span>

              <div className='circuit'>
                  <p>{circuit.name} - {circuit.circuit}</p>
              </div>

              <span className='pins'>
                {circuit.outputs?.map((pin, index) => (
                  <span style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}} key={`${circuit.name}-${pin.name}`}>
                  <span style={{width: 5, height: 20, background: 'white',display: 'block', position: 'absolute',top: 125}} id={`${circuit.name}-${pin.name}`}></span>

                  </span>
                ))}
              </span>
            </div>
            </Draggable>
      ))}
      
    </div>
  )
}

export default Breadboard
