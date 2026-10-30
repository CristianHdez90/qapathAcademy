'use client';
import './state-balloons.css';
import {useCallback,useEffect,useRef,useState} from 'react';
import type {FoundationBalloonState} from '@qapath/contracts';

/**
 * «Así se aplica» con globos por estado (SPEC-CONTENT-220 §2.6, matriz 06 §2).
 * Un globo a la vez · hover persistente · teclado (Tab, Enter/Espacio, Escape, ←/→) · toque ·
 * apertura única del estado activo al quedar visible y estable. Ningún evento emite progreso (AC-16).
 */
export function StateBalloons({flowId,title,states}:{flowId:string;title:string;states:FoundationBalloonState[]}){
 const [open,setOpen]=useState<number|null>(null),[pinned,setPinned]=useState(false);
 const root=useRef<HTMLDivElement>(null),nodes=useRef<(HTMLButtonElement|null)[]>([]),closeTimer=useRef<ReturnType<typeof setTimeout>|null>(null),autoOpened=useRef(false);
 const cancelClose=()=>{if(closeTimer.current)clearTimeout(closeTimer.current);closeTimer.current=null};
 const scheduleClose=()=>{cancelClose();if(!pinned)closeTimer.current=setTimeout(()=>setOpen(null),300)};
 const close=useCallback((focus=true)=>{const current=open;setOpen(null);setPinned(false);if(focus&&current!==null)nodes.current[current]?.focus()},[open]);
 useEffect(()=>()=>cancelClose(),[]);
 useEffect(()=>{
  const node=root.current;if(!node||typeof IntersectionObserver==='undefined')return;
  let stable:ReturnType<typeof setTimeout>|null=null;
  const observer=new IntersectionObserver(([entry])=>{
   if(stable)clearTimeout(stable);
   if(entry.isIntersecting&&entry.intersectionRatio>=.6&&!autoOpened.current)stable=setTimeout(()=>{if(!autoOpened.current){autoOpened.current=true;setOpen(value=>value??0)}},400);
  },{threshold:[0,.6,1]});
  observer.observe(node);return()=>{if(stable)clearTimeout(stable);observer.disconnect()};
 },[]);
 const panelId=`${flowId}-panel`,state=open!==null?states[open]:null;
 const onKey=(event:React.KeyboardEvent,index:number)=>{
  if(event.key==='Escape'){event.preventDefault();close();return;}
  if(event.key==='ArrowRight'||event.key==='ArrowLeft'){
   event.preventDefault();const next=(index+(event.key==='ArrowRight'?1:-1)+states.length)%states.length;
   setOpen(next);nodes.current[next]?.focus();
  }
 };
 return <div className="state-balloons" ref={root} onKeyDown={event=>{if(event.key==='Escape'&&open!==null){event.preventDefault();close()}}}>
  <p className="state-balloons-title">{title}</p>
  <p className="hint state-balloons-help">Pasa el puntero, toca o enfoca un estado para ver sus acciones y evidencias. Abrirlos no cuenta como lectura.</p>
  <ol className="state-balloons-flow" role="list">{states.map((item,i)=><li key={item.id} className={open===i?'is-open':''} onMouseEnter={()=>{cancelClose();if(!pinned)setOpen(i)}} onMouseLeave={scheduleClose}>
   <button type="button" ref={node=>{nodes.current[i]=node}} className="state-node" aria-expanded={open===i} aria-controls={panelId} data-state-id={item.id}
    onClick={()=>{if(open===i&&pinned){setOpen(null);setPinned(false)}else{setOpen(i);setPinned(true)}}} onKeyDown={event=>onKey(event,i)}>
    <span className="state-number" aria-hidden="true">{i+1}</span><span>{item.title}</span>
   </button>
   {i<states.length-1&&<span className="state-arrow" aria-hidden="true">→</span>}
  </li>)}</ol>
  <div id={panelId} className="state-balloon" role="region" aria-live="polite" aria-label={state?`Estado ${open!+1}: ${state.title}`:'Detalle del estado'} hidden={!state} onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
   {state&&<><div className="state-balloon-head"><strong>{open!+1}. {state.title}</strong><button type="button" className="text-link" onClick={()=>close()} aria-label="Cerrar globo">Cerrar ✕</button></div>
    <p className="state-balloon-label">Acciones</p><ul>{state.actions.map(action=><li key={action}>{action}</li>)}</ul>
    <dl><div><dt>Responsable posible</dt><dd>{state.owner}</dd></div><div><dt>Evidencia</dt><dd>{state.evidence}</dd></div><div><dt>Resultado</dt><dd>{state.result}</dd></div></dl></>}
  </div>
  <ol className="state-balloons-list">{states.map((item,i)=><li key={item.id}><strong>{i+1}. {item.title}</strong><ul>{item.actions.map(action=><li key={action}>{action}</li>)}</ul><p>Responsable posible: {item.owner} · Evidencia: {item.evidence} · Resultado: {item.result}</p></li>)}</ol>
 </div>;
}
