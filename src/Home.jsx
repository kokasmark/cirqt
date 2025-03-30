import React, { useEffect, useState } from "react";
import logo from '../logo.png';
import { IoAddCircleOutline } from "react-icons/io5";
import { Link } from "react-router-dom";

import { LiaSlackHash } from "react-icons/lia";
import { FaTrash } from "react-icons/fa";
import { CiExport, CiImport } from "react-icons/ci";

function Home(){
    const [projects, setProjects] = useState([])

    useEffect(()=>{
        const projects = JSON.parse(localStorage.getItem('cirqt-projects')) || [];
        setProjects(projects)
    },[])

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
        projects = projects.filter(p => p.id !== id);
        setProjects(projects)
        localStorage.setItem('cirqt-projects', JSON.stringify(projects));
    };
    
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
    

    return(
        <div className="home">
            <div className="header">
                <img src={logo} />
                <h1 style={{fontSize: '10vmin'}}>cirqt</h1>
            </div>
            <div className="projects">

                {projects.map((project,index)=>(
                        <div className="project-container">
                            <Link to={`/editor/${index}`} className="project">
                                <span style={{display: 'flex', gap: 5, alignItems: 'center'}}>
                                    <LiaSlackHash fontSize={'5em'}/>
                                    <h1>{index}</h1>
                                </span>
                                <img src={project.icon}/>
                                <p>{formatUpdatedString(project.savedAt *1)}</p>
                            </Link>

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
               <div className="project-container">
                    <span className="project" onClick={()=>addProject()}>
                        <IoAddCircleOutline fontSize={'10em'}/>
                        <h2>New Project</h2>
                    </span>
                    <div className="actions">
                        <span className="action">
                            <CiImport fontSize={'3vmin'}/>
                            <p>Import Project</p>
                        </span>
                    </div>
               </div>
            </div>
        </div>
    );
}

export default Home