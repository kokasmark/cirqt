import { useEffect, useRef, useState } from 'react'
import './App.css'
import Editor from './Editor'
import Breadboard from './Breadboard'
import logo from '../banner.png'
import { Bounce, ToastContainer, toast } from 'react-toastify';
import html2canvas from "html2canvas";
import { useParams } from "react-router-dom";
import { MdError } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'

function App() {
    const [tree, setTree] = useState([]);
    const [stats, setStats] = useState({ 'cycles': 0, 'updatedInstances': 4, 'allInstances': 0 })
    const editor = useRef(null);

    const { projectId } = useParams();
    const navigate = useNavigate();

    const [files, setFiles] = useState([])

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

    const [appConfig,setAppConfig] = useState({theme: 'night', maxCycleCount: 100, maxUpdateCount: 64 });

    const [settings, setSettings] = useState([
        {
            title: 'editor settings',
            fields: [
                { name: 'theme', default: appConfig.theme, width: 100, type: 'select', options: ['haze', 'night', 'sunset', 'cold'] },
                { name: 'gridX', default: 20, width: 50, type: 'number' },
                { name: 'gridY', default: 20, width: 50, type: 'number' },
                {name: 'animateBackground', default: false, type: 'switch'}
            ]
        },
        {
            title: 'engine settings',
            fields: [
                { name: 'maxCycleCount', default: 100, width: 50, type: 'number' },
                { name: 'maxUpdateCount', default: 64, width: 50, type: 'number' },
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
        },
        {
            title: 'about',
            fields: [
                { name: 'creator', default: 'kokasmark', width: 100, type: 'about' },
                { name: 'github', default: 'github.com/kokasmark/cirqt', width: 200, type: 'about' },
                { name: 'version', default: '1.0', width: 50, type: 'about' }
            ]
        }]);
    
    const updateConfig = (key,value) => {
        console.log(`Config updated at ${key} to ${value}`)
        let updatedConfig = appConfig;
        updatedConfig[key] = value;
        setAppConfig(updatedConfig)

        saveConfig();
        success('Config saved!')
    }

    const success = (msg) => {
        toast.success(msg, {
            position: "bottom-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
            });
    }
    const error = (msg) => {
        toast.error(msg, {
            position: "bottom-center",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
            });
    }

    const saveProject = async () => {
        const projects = JSON.parse(localStorage.getItem('cirqt-projects')) || [];
        let updatedProjects = projects;
        const icon = await getProjectIcon();
        
        if (projects.some(p => p.id == projectId)) {
            updatedProjects = projects.map(p => 
                p.id == projectId ? { ...p, files, savedAt: Date.now(), icon } : p
            );
        }else{
            error(`Couldnt save project with id: ${projectId}`)
        }
    
        localStorage.setItem('cirqt-projects', JSON.stringify(updatedProjects));

        success('Project saved!');
    };
    
    
    const getProjectIcon = async () => {
        const breadboard = document.getElementById(`editor`);
        if (!breadboard) return;

        const canvas = await html2canvas(breadboard, {backgroundColor: null});
       
        const image = canvas.toDataURL("image/png");
    
       return image;
    };
    
    const saveConfig = () => {
        localStorage.setItem('cirqt-config', JSON.stringify(appConfig));
        localStorage.setItem('cirqt-config-savedAt', Date.now());
    };
    
    useEffect(() => {    
        let projects = JSON.parse(localStorage.getItem('cirqt-projects')) || [];
        let currentProject = projects.find(p => p.id == projectId);
        if (currentProject) {

            setFiles(currentProject.files);
            let savedAt = new Date(currentProject.savedAt * 1);
            success(`Loaded Project from ${savedAt.getFullYear()} / ${savedAt.getMonth() + 1} / ${savedAt.getDate()}`);
        }
    
        let savedConfig = JSON.parse(localStorage.getItem('cirqt-config'));
        if (savedConfig) {
            setAppConfig(savedConfig);
            let savedAt = new Date(localStorage.getItem('cirqt-config-savedAt') * 1);
            success(`Loaded Config from ${savedAt.getFullYear()} / ${savedAt.getMonth() + 1} / ${savedAt.getDate()}`);
        }
    }, []);
    

    let projects = JSON.parse(localStorage.getItem('cirqt-projects')) || [];
    let currentProject = projects.find(p => p.id == projectId);


    if(currentProject){
        return (
            <div className={`app ${appConfig.theme}`} id='app'>
                <span className='background'></span>
                <div className='header'>
                    <img src={logo} style={{height: '80%'}} onClick={()=> navigate('/')}/>
                    <div className='actions'>
                        <span className={`action-btn`} style={{ background: '#FF7E7E' }} data-title="Save Project" onClick={() => {saveProject()}}></span>
                        <span className={`action-btn`} style={{ background: '#DDF58B' }} data-title="Console" onClick={() => action === 1 ? setAction(-1) : setAction(1)}></span>
                        <span className={`action-btn`} style={{ background: '#7F95EB' }} data-title="Settings" onClick={() => action === 2 ? setAction(-1) : setAction(2)}></span>
                    </div>
                </div>


                <div className={`container`}>
                    <Editor ref={editor} files={files}
                        callback={setTree} setCode={setCode} setStats={setStats} addFile={addFile} setCurrent={setCurrent} current={current}
                        appConfig={appConfig}/>
                    <Breadboard tree={tree} stats={stats} 
                    update={updateTree} updateSchema={updateSchema} schema={files[current] ? files[current].schema : {}}
                    appConfig={appConfig}/>
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
                                                    {field.type === "select" &&
                                                        <select style={{ width: field.width }} value={appConfig[field.name]} onChange={(e)=>updateConfig(field.name, e.target.value)}>
                                                            {field.options.map((option, index) => (
                                                                <option value={option}>{option}</option>
                                                            ))}
                                                    </select>}
                                                    
                                                    {field.type === "about" &&
                                                        <input defaultValue={field.default} value={appConfig[field.name]} style={{ width: field.width, color: 'white' }} 
                                                        disabled
                                                        onChange={(e) => updateConfig(field.name, e.target.value)}></input>
                                                    }
                                                    {field.type === "number" &&
                                                        <input defaultValue={field.default} value={appConfig[field.name]} style={{ width: field.width, color: 'white' }} onChange={(e) => updateConfig(field.name, e.target.value)}></input>
                                                    }
                                                    {field.type === "color" &&
                                                        <input defaultValue={field.default} value={appConfig[field.name]} style={{ width: field.width, color: appConfig[field.name] ?appConfig[field.name] : field.default }}
                                                        onChange={(e) => updateConfig(field.name, e.target.value)}></input>
                                                    }
                                                    {field.type === 'switch'&&
                                                        <label class="switch">
                                                        <input type="checkbox" checked={appConfig[field.name]} onChange={(e) => updateConfig(field.name, e.target.checked)}/>
                                                        <span class="slider round"></span>
                                                </label>} 
                                                </span>
                                            ))}
                                        </span>
                                    </span>
                                ))}
                            </span>
                        </div>
                    </div>
                }
                {action === 1 && 
                <div className="settings-dropdown">
                    <div className="settings">
                    <h1>Console</h1>

                        <span className='settings-container'>
                            <span className='fields'>
                            {tree.map((instance,index) => (
                                <span>
                                    
                                    {instance.inputs.map((pin, index)=>(
                                        <span className='field' style={{width: '100%', gap: '2em',borderBottom: '1px solid var(--primary)'}}>
                                            <p style={{ background: 'var(--secondary)', padding: 5, borderRadius: 5, width: '5%', textAlign: 'center' }}>{instance.name}.{pin.name}</p>
                                            <p style={{color: (pin.voltage === "H" || pin.voltage.includes('hz')) ? 'violet' : 'white', fontSize: 20, width: '5%', textAlign: 'center'}}>{pin.voltage}</p>
                                            <p style={{fontSize: 20, width: '10%', textAlign: 'center'}}>{pin.value}</p>
                                            <p style={{fontSize: 20, width: '10%', textAlign: 'center'}}>{instance.step}</p>
                                        </span>
                                    ))}

                                    {instance.outputs.map((pin, index)=>(
                                        <span className='field' style={{width: '100%', gap: '2em',borderBottom: '1px solid var(--primary)'}}>
                                            <p style={{ background: 'var(--secondary)', padding: 5, borderRadius: 5, width: '5%', textAlign: 'center' }}>{instance.name}.{pin.name}</p>
                                            <p style={{color: (pin.voltage === "H" || pin.voltage.includes('hz')) ? 'violet' : 'white', fontSize: 20, width: '5%', textAlign: 'center'}}>{pin.voltage}</p>
                                            <p style={{fontSize: 20, width: '10%', textAlign: 'center'}}>{pin.value}</p>
                                            <p style={{fontSize: 20, width: '10%', textAlign: 'center'}}>{instance.step}</p>
                                        </span>
                                    ))}
                                </span>
                            ))}
                            </span>
                        </span>
                    </div>
                    </div>}
            </div>
        )
    }
    else{
        return(<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh', flexDirection: 'column'}}>
            <MdError fontSize={'20em'}/>
            <h1>No project exists with id {projectId}</h1>
        </div>)
    }
}

export default App
