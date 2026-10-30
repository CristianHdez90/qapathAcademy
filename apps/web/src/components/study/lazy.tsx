'use client';
import dynamic from 'next/dynamic';
/** Librerías pesadas cargadas solo en el navegador y solo cuando una lección las usa. */
const loading=(label:string)=>function Loading(){return <p role="status" className="study-loading">{label}</p>};
export const MermaidDiagram=dynamic(()=>import('./mermaid-diagram').then(m=>m.MermaidDiagram),{ssr:false,loading:loading('Cargando diagrama…')});
export const FlowGraph=dynamic(()=>import('./flow-graph').then(m=>m.FlowGraph),{ssr:false,loading:loading('Cargando mapa interactivo…')});
export const StudyChart=dynamic(()=>import('./study-chart').then(m=>m.StudyChart),{ssr:false,loading:loading('Cargando gráfica…')});
