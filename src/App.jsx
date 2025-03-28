import { useEffect, useRef, useState } from 'react'
import './App.css'
import Editor from './Editor'
import Breadboard from './Breadboard'

function App() {
  const [tree, setTree] = useState([]);
  const [stats, setStats] = useState({'cycles': 0, 'updatedInstances': 4, 'allInstances': 0})
  const editor = useRef(null);

  const [files, setFiles] = useState([
    {title: 'Library', 
    code: `[rled <in >out
    out < in
]
[gled <in >out
    out < in
]
[bled <in >out
    out < in
]
[switch <in >out
    out < in
]
[matrix4x4]
[clock <hz >out
    
]
[and <a <b >out
    out < a & b
]
[nand <a <b >out
    out < a !& b
]
[or <a <b >out
    out < a | b
]
[nor <a <b >out
    out < a !| b
]
[xor <a <b >out
    out < a x| b
]
[xnor <a <b >out
    out < a x!| b
]
[not <in >out
    out < ! in
]
[sr_latch <S <R >Q >QN
    Q < ! (R | QN)
    QN < ! (S | Q)
]`},
    {title: 'Board(1)', 
code: 
`[a <clk <i1 <i2 >o1 >o2 >o3
    o1 < (! i1) & (! i2)
    o2 < i1 & (! i2)
    o3 < i1 & i2
]
[board <H <_ 
    a aa
    rled l
    gled g
    bled b
    clock c
    
    c.hz < 1hz
    aa.clk < c.out

    aa.i1 < b011011
    aa.i2 < b001001
    
    l.in < aa.o1
    g.in < aa.o2
    b.in < aa.o3 # This is a comment
]`}
    ]
    )

    const setCode = (index,code) => {
        let updatedFiles = files;
        
        updatedFiles[index].code = code;

        setFiles(updatedFiles)
    }

    const addFile = () =>{
        let updatedFiles = files;
        updatedFiles.push({title: `Board(${files.length})`, code: `#Let your imagination run wild`})
        setFiles(updatedFiles)
    }

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
      <p style={{fontSize: 20, fontWeight: 'bolder', color: '#fff'}}>[cirqt]</p>
        <div className='actions'>
          <span className='action-btn' style={{background: '#FF7E7E'}} data-title="Close Board"></span>
          <span className='action-btn' style={{background: '#DDF58B'}} data-title="Save Board"></span>
          <span className='action-btn' style={{background: '#7F95EB'}} data-title="Settings"></span>
        </div>
      </div>

    
      <div className='container'>
        <Editor ref={editor} files={files} 
        callback={setTree} setCode={setCode} setStats={setStats} addFile={addFile}/>
        <Breadboard tree={tree} update={updateTree} stats={stats}/>
      </div>
    </div>
  )
}

export default App
