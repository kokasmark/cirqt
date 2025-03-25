import { useEffect, useRef, useState } from 'react'
import './App.css'
import Editor from './Editor'
import Breadboard from './Breadboard'

function App() {
  const [tree, setTree] = useState([]);
  const editor = useRef(null);

  const updateTree = (updatedCircuit) => {
    setTree(prevTree => {
        const updatedTree = prevTree.map(circuit =>
            circuit.name === updatedCircuit.name ? updatedCircuit : circuit
        );

        if (editor.current) {
            editor.current.evaluate(updatedTree);
        } else {
            console.warn("Editor ref is not assigned yet!");
        }

        return updatedTree; 
    });
};


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
        <Editor callback={setTree} ref={editor}/>
        <Breadboard tree={tree} update={updateTree}/>
      </div>
    </div>
  )
}

export default App
