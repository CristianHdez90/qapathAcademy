'use client';
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {ConceptStepIcon} from './concept-step-icon';
import './concept-demonstration.css';
function subscribeReducedMotion(callback:()=>void){const media=window.matchMedia('(prefers-reduced-motion: reduce)');media.addEventListener('change',callback);return()=>media.removeEventListener('change',callback)}
const reducedSnapshot=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const serverSnapshot=()=>false;

/** The same ordered explanation remains readable without motion or JavaScript. */
export function ConceptDemonstration({conceptId,title,steps,icons}:{conceptId:string;title:string;steps:readonly string[];icons?:readonly string[]}){
 const [mode,setMode]=useState<'idle'|'playing'|'paused'|'done'>('idle');
 const root=useRef<HTMLDivElement>(null);
 const current=useRef(mode),manuallyPaused=useRef(false);
 const reduced=useSyncExternalStore(subscribeReducedMotion,reducedSnapshot,serverSnapshot);
 const motion=reduced?'reduced':mode;
 useEffect(()=>{
  const element=root.current;if(!element||reduced)return;
  const card=element.closest('.reading-concept')||element;
  let visible=false;
  const play=()=>{
   if(!visible||document.visibilityState!=='visible'||manuallyPaused.current||current.current==='playing')return;
   current.current='playing';setMode('playing');
  };
  const pauseOutside=()=>{if(current.current==='playing'){current.current='paused';setMode('paused')}};
  const observer=new IntersectionObserver(entries=>{
   for(const entry of entries){
    const wasVisible=visible;visible=entry.isIntersecting&&entry.intersectionRatio>=.25;
    if(visible&&!wasVisible)play();else if(!visible)pauseOutside();
   }
  },{threshold:[0,.25]});
  observer.observe(element);
  const onVisibility=()=>{if(document.visibilityState==='visible')play();else pauseOutside()};
  card.addEventListener('pointerenter',play);card.addEventListener('focusin',play);
  document.addEventListener('visibilitychange',onVisibility);
  return()=>{observer.disconnect();card.removeEventListener('pointerenter',play);card.removeEventListener('focusin',play);document.removeEventListener('visibilitychange',onVisibility)};
 },[reduced]);
 return <div ref={root} className="concept-demo" data-motion={motion}>
  <div className="concept-demo-heading"><span>Así se aplica</span><button type="button" aria-label={`${mode==='playing'&&!reduced?'Pausar':mode==='paused'&&!reduced?'Continuar':mode==='done'?'Repetir':'Ver'} animación: ${title}`} disabled={reduced} onClick={()=>{const next=current.current==='playing'?'paused':'playing';manuallyPaused.current=next==='paused';current.current=next;setMode(next)}}>{reduced?'Movimiento reducido':mode==='playing'?'Ⅱ Pausar':mode==='paused'?'▶ Continuar':mode==='done'?'↻ Repetir':'▶ Ver animación'}</button></div>
  <div className="concept-demo-story"><div className="concept-demo-track" aria-hidden="true"><i onAnimationEnd={event=>{if(event.target===event.currentTarget){current.current='done';setMode('done')}}}/></div><ol aria-label={`Secuencia: ${title}`}>{steps.map((step,i)=><li key={step}><span className={`concept-demo-node node-${i}`} aria-hidden="true"><ConceptStepIcon conceptId={conceptId} index={i} icon={icons?.[i]}/><span className="concept-demo-step-number">{i+1}</span></span><span>{step}</span></li>)}</ol></div>
  <span className="concept-demo-status" role="status">{reduced?'Lee la secuencia de izquierda a derecha.':mode==='playing'?'Demostración en curso · 6 segundos':mode==='paused'?'Demostración en pausa':mode==='done'?'Secuencia completada':'La animación comienza al llegar aquí o acercar el puntero.'}</span>
 </div>;
}
