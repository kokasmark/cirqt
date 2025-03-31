import React, { useEffect, useState } from "react";
import logo from '../logo.png';
import { IoAddCircleOutline } from "react-icons/io5";
import { Link,useNavigate } from "react-router-dom";

import { LiaSlackHash } from "react-icons/lia";
import { FaGithub, FaTrash } from "react-icons/fa";
import { CiExport, CiImport } from "react-icons/ci";
import { FaMicrochip } from "react-icons/fa";
import { MdError } from "react-icons/md";

import { Bounce, ToastContainer, toast } from 'react-toastify';

function Home(){
    const [projects, setProjects] = useState([])
    const [opening, setOpening] = useState(-1);
    const navigate = useNavigate();
    useEffect(()=>{
        const projects = JSON.parse(localStorage.getItem('cirqt-projects')) || [];
        setProjects(projects)
    },[])


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

    const addProject = () => {
        let projects = JSON.parse(localStorage.getItem('cirqt-projects')) || [];
        let newId = projects.length;
        let newProject = { id: newId, files: [{
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
[sevensegment <a <b <c <d <e <f <g <clk
    
]
[sr_latch <S <R >Q >QN
    Q < ! (R | QN)
    QN < ! (S | Q)
]`,
schema: {}}], savedAt: Date.now(), icon: null };
        
        projects.push(newProject);

        setProjects(projects)
        localStorage.setItem('cirqt-projects', JSON.stringify(projects));
    };
    
    const removeProject = (id) => {
        let projects = JSON.parse(localStorage.getItem('cirqt-projects')) || [];
        projects = projects.filter(p => p.id != id);
        setProjects(projects)
        localStorage.setItem('cirqt-projects', JSON.stringify(projects));
        success(`Removed project #${id}`)
    };

    const openProject = (id) =>{
        setOpening(id);
        navigate(`/editor/${id}`)
    }
    
    const formatUpdatedString = (timestamp) => {
        const now = Date.now();
        const diffMs = now - timestamp;
        const diffMinutes = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMinutes < 60) {
            return `${diffMinutes} minutes ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hours ago`;
        } else if(!isNaN(diffDays)){
            return `${diffDays} days ago`;
        }
        else{
          return `No data`;
        }
    }
    
    const exportProject = (index) => {
        let projects = JSON.parse(localStorage.getItem('cirqt-projects')) || [];
        if (projects.length <= index) return;
    
        let project = projects[index];
        let projectData = JSON.stringify(project, null, 2); 
        
        const blob = new Blob([projectData], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `project_${project.id}.cqt`;
        
        link.click();
    };
    
    const importProject = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".cqt";
        input.style.display = "none";
    
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;
    
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    let projects = JSON.parse(localStorage.getItem("cirqt-projects")) || [];
                    let importedProject = JSON.parse(e.target.result);
    
                    importedProject.id = projects.length;
                    projects.push(importedProject);
    
                    localStorage.setItem("cirqt-projects", JSON.stringify(projects));
                    setProjects(projects)
                    success("Successfully imported project!");
                } catch (e) {
                   error("Invalid project file!");
                }
            };
            reader.readAsText(file);
        };
    
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    };

    return(
        <div className="home">
            <span className="background"></span>
            <div className="header">
                <img src={logo} />
                <h1 style={{fontSize: '10vmin',fontFamily: 'ff-moon'}}>cirqt</h1>
            </div>
            <span className="info">
                <span>
                    <FaGithub fontSize={"2em"}/>
                    <p>https://github.com/kokasmark/cirqt</p>
                </span>
                <span>
                    <MdError fontSize={"2em"}/>
                    <p>https://github.com/kokasmark/cirqt/issues</p>
                </span>
            </span>
            <div className="projects">
                <div className="project-container">
                    <span className="project" onClick={()=>addProject()}>
                        <IoAddCircleOutline fontSize={'10em'}/>
                        <h2>New Project</h2>
                    </span>
                    <div className="actions">
                        <span className="action" onClick={()=>importProject()}>
                            <CiImport fontSize={'3vmin'}/>
                            <p>Import Project</p>
                        </span>
                    </div>
                </div>
                {projects.map((project,index)=>(
                        <div className="project-container">
                            <span onClick={()=>openProject(project.id)} className={`project ${opening === project.id ? 'opening' :''}`}>
                                <span style={{display: 'flex', gap: 5, alignItems: 'center'}}>
                                    <LiaSlackHash filter={'none'} fontSize={'5em'}/>
                                    <h1>{index}</h1>
                                </span>
                                <img src={project.icon}/>
                                <p style={{fontWeight: 'bolder'}}>{formatUpdatedString(project.savedAt *1)}</p>
                                <span style={{display: 'flex', gap: 5, fontStyle: 'italic', fontSize: 10}}>
                                    {project.files.slice(0,5).map((file,index)=>(
                                        <p>{file.title}.cqt {index+1 < project.files.length ? '|' : ''}</p>
                                    ))}
                                </span>
                            </span>

                            <div className="actions">
                                <span className="action" onClick={()=>removeProject(index)}>
                                    <FaTrash fontSize={'3vmin'}/>
                                    <p>Delete Project</p>
                                </span>
                                <span className="action" onClick={()=>exportProject(index)}>
                                    <CiExport fontSize={'3vmin'}/>
                                    <p>Export Project</p>
                                </span>
                            </div>
                        </div>
                ))}
            </div>

            <ToastContainer
                position="bottom-center"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                transition={Bounce}
                />
        </div>
    );
}

export default Home