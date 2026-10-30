'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {studyPalette} from './study-theme';
/** Renderiza un diagrama Mermaid a SVG en el navegador (securityLevel «strict»: sin HTML ni eventos click). */
let queue:Promise<unknown>=Promise.resolve();
export function MermaidDiagram({code,title}:{code:string;title?:string}){
 const host=useRef<HTMLDivElement>(null),id=useId().replace(/[^a-zA-Z0-9]/g,'');
 const [state,setState]=useState<'loading'|'ready'|'error'>('loading'),[error,setError]=useState('');
 useEffect(()=>{
  let alive=true;
  // Mermaid mantiene configuración global: se serializan los renders para no mezclar temas.
  queue=queue.then(async()=>{
   try{
    const mermaid=(await import('mermaid')).default,p=studyPalette();
    mermaid.initialize({startOnLoad:false,securityLevel:'strict',theme:'base',fontFamily:'inherit',flowchart:{htmlLabels:false},
     themeVariables:{darkMode:!p.light,background:p.background,primaryColor:p.surface,primaryTextColor:p.text,primaryBorderColor:p.primary,lineColor:p.muted,secondaryColor:p.border,tertiaryColor:p.background,textColor:p.text,noteBkgColor:p.surface,noteTextColor:p.text,fontSize:'15px'}});
    const {svg}=await mermaid.render(`mmd${id}${Date.now()}`,code);
    if(alive&&host.current){host.current.innerHTML=svg;const el=host.current.querySelector('svg');el?.setAttribute('role','img');if(title)el?.setAttribute('aria-label',title);setState('ready')}
   }catch(cause){if(alive){setError(cause instanceof Error?cause.message.split('\n')[0]:'Sintaxis no válida.');setState('error')}}
  });
  return()=>{alive=false};
 },[code,id,title]);
 return <figure className="study-figure study-mermaid">
  {title&&<figcaption>{title}</figcaption>}
  {state==='loading'&&<p role="status" className="study-loading">Dibujando diagrama…</p>}
  {state==='error'&&<div role="alert" className="study-error"><p>No se pudo dibujar el diagrama: {error}</p><pre><code>{code}</code></pre></div>}
  <div ref={host} className="study-mermaid-canvas" hidden={state!=='ready'}/>
 </figure>;
}
