'use client';
import {useState} from 'react';
import {PracticeExecution,type PracticeRun} from './practice-execution';
import {GitLab} from './git-lab';
import './tools-mission.css';
export function ProgrammingLab({initial,onResult}:{initial?:PracticeRun;onResult:(run:PracticeRun)=>void}){
 const [tool,setTool]=useState('code');const permitted=(mode:string)=>initial?.mode===mode?initial:undefined;
 return <div className="tools-mission"><h2>Programa y versiona</h2><p>Practica JavaScript y conserva tu trabajo en Git.</p><div className="tools-tabs" role="group" aria-label="Herramientas de programación">{[['code','JavaScript'],['git','Comandos Git']].map(([value,label])=><button type="button" aria-pressed={tool===value} key={value} onClick={()=>setTool(value)}>{label}</button>)}</div><div hidden={tool!=='code'}><PracticeExecution week={9} initial={permitted('code')} onResult={onResult}/></div><div hidden={tool!=='git'}><GitLab week={9} guided initial={permitted('git')} onResult={onResult}/></div><p className="hint">Guarda la evidencia antes de salir. El guardado conserva la última ejecución y tus notas; trabajar en el repositorio de práctica no publica cambios.</p></div>;
}
