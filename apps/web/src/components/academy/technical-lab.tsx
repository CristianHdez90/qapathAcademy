'use client';
import {useState} from 'react';
import {PracticeExecution,type PracticeRun} from './practice-execution';
import {DevToolsLab} from './devtools-lab';
import './tools-mission.css';
export function TechnicalLab({initial,onResult}:{initial?:PracticeRun;onResult:(run:PracticeRun)=>void}){
 const [tool,setTool]=useState('sql');const permitted=(mode:string)=>initial?.mode===mode?initial:undefined;
 return <div className="tools-mission"><h2>Consulta datos e investiga con DevTools</h2><div className="tools-tabs" role="group" aria-label="Herramientas de QA técnico">{[['sql','Base de datos SQL'],['devtools','DevTools']].map(([value,label])=><button type="button" aria-pressed={tool===value} key={value} onClick={()=>setTool(value)}>{label}</button>)}</div><div hidden={tool!=='sql'}><PracticeExecution week={8} initial={permitted('sql')} onResult={onResult}/></div><div hidden={tool!=='devtools'}><DevToolsLab initial={permitted('http')} onResult={onResult}/></div><p className="hint">Guarda la última ejecución y tus notas en Guardar y revisar evidencia antes de salir.</p></div>;
}
