import { useEffect, useRef, useState } from 'react'
import './App.css'
import Editor from './Editor'
import Breadboard from './Breadboard'
import logo from '../banner.png'

function App() {
    const [tree, setTree] = useState([]);
    const [stats, setStats] = useState({ 'cycles': 0, 'updatedInstances': 4, 'allInstances': 0 })
    const editor = useRef(null);

    const [files, setFiles] = useState([
        {
            title: 'library',
            code: `
[rled <in >out
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
]`,
schema: {}},
        {
            title: 'board(1)',
            code:
                `
.include library # contains basic circuits

[a <clk <i1 <i2 >o1 >o2 >o3
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
]`,
schema:{
    "aa": {
        "x": 167,
        "y": 255
    },
    "b": {
        "x": 66,
        "y": 401
    },
    "l": {
        "x": -69,
        "y": 413
    },
    "c": {
        "x": -139,
        "y": 91
    },
    "g": {
        "x": -5,
        "y": 433
    }
}}
    ]
    )

    const setCode = (index, code) => {
        let updatedFiles = files;

        updatedFiles[index].code = code;

        setFiles(updatedFiles)
    }

    const updateSchema = (key, value) => {
        let updatedFiles = files;
        console.log(`Schema updated at ${key}!`)
        updatedFiles[current].schema[key] = value;
        console.log( updatedFiles[current].schema)
        setFiles(updatedFiles)
    }

    const addFile = () => {
        let updatedFiles = files;
        updatedFiles.push({
            title: `board(${files.length})`,
            code: `
.include library

#Your .cqt file is ready!

[board <H <_

# Start coding here!

]

`,
schema: {}}
)
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

    const [action, setAction] = useState(-1);

    const [current, setCurrent] = useState(0);

    const [appConfig,setAppConfig] = useState({theme: 'night' });

    const [settings, setSettings] = useState([
        {
            title: 'editor settings',
            fields: [
                { name: 'theme', default: appConfig.theme, width: 100, type: 'select', options: ['haze', 'night', 'sunset', 'cold'] },
                { name: 'gridX', default: 20, width: 50, type: 'number' },
                { name: 'gridY', default: 20, width: 50, type: 'number' },
            ]
        },
        {
            title: 'engine settings',
            fields: [
                { name: 'maxCycleCount', default: 100, width: 50, type: 'number' },
                { name: 'maxUpdateCount', default: '-', width: 50, type: 'number' },
                { name: 'maxClockHertz', default: '-', width: 50, type: 'number' }
            ]
        },
        {
            title: 'syntax highlight settings',
            fields: [
                { name: 'keywordColor', default: 'cyan', width: 100, type: 'color' },
                { name: 'operatorColor', default: 'orange', width: 100, type: 'color' },
                { name: 'typeColor', default: 'violet', width: 100, type: 'color' },
                { name: 'gateColor', default: 'lightgreen', width: 100, type: 'color' },
                { name: 'pinColor', default: '#7f95eb', width: 100, type: 'color' },
                { name: 'commentColor', default: '#ff7e7e', width: 100, type: 'color' }
            ]
        }]);
    
    const updateConfig = (key,value) => {
        console.log(`Config updated at ${key} to ${value}`)
        let updatedConfig = appConfig;
        updatedConfig[key] = value;
        setAppConfig(updatedConfig)
    }

    return (
        <div className={`app ${appConfig.theme}`} id='app'>
            <div className='header'>
                <img src={logo} style={{height: '90%'}}/>
                <div className='actions'>
                    <span className={`action-btn`} style={{ background: '#FF7E7E' }} data-title="Close Board" onClick={() => action === 0 ? setAction(-1) : setAction(0)}></span>
                    <span className={`action-btn`} style={{ background: '#DDF58B' }} data-title="Save Board" onClick={() => action === 1 ? setAction(-1) : setAction(1)}></span>
                    <span className={`action-btn`} style={{ background: '#7F95EB' }} data-title="Settings" onClick={() => action === 2 ? setAction(-1) : setAction(2)}></span>
                </div>
            </div>


            <div className={`container`}>
                <Editor ref={editor} files={files}
                    callback={setTree} setCode={setCode} setStats={setStats} addFile={addFile} setCurrent={setCurrent} current={current}/>
                <Breadboard tree={tree} stats={stats} 
                 update={updateTree} updateSchema={updateSchema} schema={files[current].schema}/>
            </div>

            {action === 2 &&
                <div className="settings-dropdown">
                    <div className="settings">
                        <h1>Settings</h1>
                        <span className='settings-container'>
                            {settings.map((setting, index) => (
                                <span style={{ display: 'block', borderBottom: '1px solid var(--primary)', width: '100%', padding: 5 }}>
                                    <h2>{setting.title}</h2>
                                    <span className='fields'>
                                        {setting.fields.map((field, index) => (
                                            <span className='field'>
                                                <p style={{ background: 'var(--secondary)', padding: 5, borderRadius: 5 }}>{field.name}</p>
                                                {field.type !== "select" ?
                                                    <input defaultValue={field.default} style={{ width: field.width, color: field.type === "color" ? field.default : 'white' }}></input> :
                                                    <select style={{ width: field.width }} onChange={(e)=>updateConfig(field.name, e.target.value)}>
                                                        {field.options.map((option, index) => (
                                                            <option value={option}>{option}</option>
                                                        ))}
                                                    </select>}
                                            </span>
                                        ))}
                                    </span>
                                </span>
                            ))}
                        </span>
                    </div>
                </div>
            }
        </div>
    )
}

export default App
