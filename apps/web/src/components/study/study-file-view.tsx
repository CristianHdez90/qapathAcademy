'use client';
import type {ChartInteraction,GraphInteraction,StudyFileKind} from '@qapath/contracts';
import {StudyMarkdown} from './study-markdown';
import {FlowGraph,MermaidDiagram,StudyChart} from './lazy';
import './study.css';
const caption=(filename:string)=>filename.replace(/\.[^.]+$/,'').replace(/[-_]+/g,' ');
/** Muestra un archivo de estudio según su tipo. El contenido ya fue validado por la API (y por el editor). */
export function StudyFileView({file}:{file:{kind:StudyFileKind;filename:string;content:string}}){
 if(file.kind==='markdown')return <StudyMarkdown source={file.content}/>;
 if(file.kind==='mermaid')return <MermaidDiagram code={file.content} title={caption(file.filename)}/>;
 if(file.kind==='svg')return <figure className="study-figure study-svg">{/* SVG en <img>: sin scripts ni recursos externos */}
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(file.content)}`} alt={caption(file.filename)}/><figcaption>{caption(file.filename)}</figcaption></figure>;
 let data:GraphInteraction|ChartInteraction;
 try{data=JSON.parse(file.content)}catch{return <p role="alert" className="study-error">No se pudo leer la interacción {file.filename}.</p>}
 return data.type==='graph'?<FlowGraph graph={data}/>:<StudyChart chart={data}/>;
}
