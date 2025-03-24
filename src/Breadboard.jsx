import { useState } from 'react'
import './App.css'

function Breadboard({tree}) {

  return (
    <div className='breadboard'>
      {tree.map((circuit, index)=>(
        <div className='circuit-container'>
          <span className='pins'>
            {circuit.inputs?.map((pin, index) => (
              <span style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <p style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>{pin.name} <span style={{color: 'violet'}}>{pin.value ? pin.value : 'None'}</span></p>
              <span style={{width: 5, height: 20, background: 'white',display: 'block', position: 'absolute',top: 55}}></span>
              </span>
            ))}
          </span>

          <div className='circuit'>
              <p>{circuit.name} - {circuit.circuit}</p>
          </div>

          <span className='pins'>
            {circuit.outputs?.map((pin, index) => (
              <span style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <span style={{width: 5, height: 20, background: 'white',display: 'block', position: 'absolute',top: 125}}></span>
              <p>{pin.name}</p>
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  )
}

export default Breadboard
