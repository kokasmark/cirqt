import { useState } from 'react'
import './App.css'
import Editor from './Editor'
import Breadboard from './Breadboard'

function App() {
  const [tree, setTree] = useState([]);
  return (
    <div className='app'>
      <div className='header'>
        <h1 style={{ margin: 0 }}><span className='operator'>[</span><span className='keyword'>cirqt</span>  <span className='operator'>&lt;</span>code  <span className='operator'>&gt;</span>circuit<span className='operator'>]</span></h1>
        <h3 style={{margin: 0}} >where software and hardware meet</h3>
        <div className='actions'>
          <span className='action-btn' style={{background: '#FF7E7E'}}></span>
          <span className='action-btn' style={{background: '#DDF58B'}}></span>
          <span className='action-btn' style={{background: '#7F95EB'}}></span>
        </div>
      </div>

    
      <div className='container'>
        <Editor callback={setTree} />
        <Breadboard tree={tree} />
      </div>
    </div>
  )
}

export default App
