'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import {QUIZ_PASS_PERCENT,practiceCompleted,foundationRules,foundationChapterPassed} from '@qapath/progress';
import {useProgress} from '@/features/progress/progress-provider';
import {closingTestHref} from '@/features/progress/learning-navigation';
import modules from '@/features/navigation/learning-tree.json';

function Branch({label,active=false,children,root=false,done=false}:{label:string;active?:boolean;children:ReactNode;root?:boolean;done?:boolean}){
 const disclosure=useRef<HTMLDetailsElement>(null);
 useEffect(()=>{if(active&&disclosure.current)disclosure.current.open=true},[active]);
 return <details className={root?'route-tree-root':'route-tree-branch'} ref={disclosure}><summary className={root?'nav-item route-tree-heading':''}>{root&&<span className="nav-icon" aria-hidden="true">◫</span>}<span>{label}</span>{done&&<span className="route-tree-done" aria-label="Completado" title="Completado">✓</span>}<span className="route-tree-chevron" aria-hidden="true"><span className="tree-expand">+</span><span className="tree-collapse">−</span></span></summary><div className="route-tree-children">{children}</div></details>;
}
export function LearningTree({onNavigate,focused=false}:{onNavigate?:()=>void;focused?:boolean}){
 const path=usePathname(),{state,ready}=useProgress();const [hash,setHash]=useState('');
 useEffect(()=>{const sync=()=>setHash(window.location.hash);sync();window.addEventListener('hashchange',sync);window.addEventListener('popstate',sync);return()=>{window.removeEventListener('hashchange',sync);window.removeEventListener('popstate',sync)}},[path]);
 const current=path+hash;
 const navigate=(href:string)=>{
  setHash(href.includes('#')?'#'+href.split('#')[1]:'');onNavigate?.();
  if(href.split('#')[0]===path)requestAnimationFrame(()=>requestAnimationFrame(()=>{
   const target=document.getElementById(href.split('#')[1]||'');if(!target)return;
   let parent:HTMLElement|null=target;while(parent){if(parent instanceof HTMLDetailsElement)parent.open=true;parent=parent.parentElement}
   target.focus({preventScroll:true});target.scrollIntoView({block:'start',behavior:'instant'});
  }));
 };
 const destination=(href:string,label:string,done?:boolean)=> <Link key={href} href={focused&&href.startsWith('/study/')?href.split('#')[0]+(href.includes('?')?'&':'?')+'view=focused'+(href.includes('#')?'#'+href.split('#')[1]:''):href} className="route-tree-link" aria-current={current===href.split('?')[0]+(href.includes('?')&&href.includes('#')?'#'+href.split('#')[1]:'')?'location':undefined} onClick={()=>navigate(href)}><span>{label}</span>{ready&&done&&<span className="route-tree-done" title="Completado" aria-label="Completado">✓</span>}</Link>;
 return <div className="learning-route-tree"><Branch label="Ruta de 8 módulos" active={path.startsWith('/modules')||path.startsWith('/study')||path.startsWith('/practice/')} root>
 <p className="route-tree-legend">✓ Solo actividades completadas. + / − abre o cierra opciones.</p>{destination('/modules','Ver los 8 módulos')}
 {modules.map(module=>{
  const active=path===`/modules/${module.id}`||module.weeks.some(w=>path===`/study/${w.id}`||path===`/practice/${w.id}`);
  return <Branch key={module.id} label={`Módulo ${Number(module.number)} · ${module.title}`} active={active}>
   {destination(`/modules/${module.id}`,'Vista del curso')}
   <p className="route-tree-category">CONTENIDO DE ESTUDIO</p>
   {module.weeks.map(week=>{
    const base=`/study/${week.id}`;const inWeek=path===base||path===`/practice/${week.id}`;
    return <Branch key={week.id} label={`Semana ${week.id}`} active={inWeek}>
     {destination(base,week.title,state.weeks.includes(week.id))}
     {week.foundation?<Branch label="Capítulos" done={ready&&state.read.includes(week.id)} active={path===base&&hash.startsWith('#FND-')}>
      {week.foundation.map(chapter=>{const rule=foundationRules.find(item=>item.id===chapter.id);return <Branch key={chapter.id} label={`CAPÍTULO ${String(chapter.number).padStart(2,'0')} · ${chapter.title}`} done={ready&&!!rule&&foundationChapterPassed(state,rule)} active={path===base&&hash.startsWith(`#${chapter.anchor}`)}>
       {chapter.cards.length?<>{destination(`${base}#${chapter.anchor}`,'Presentación del capítulo')}{chapter.cards.map(card=>destination(`${base}#${card.id}`,card.title,!!state.foundationCards?.[card.id]))}</>:destination(`${base}#${chapter.anchor}`,'En preparación')}
      </Branch>})}
     </Branch>:<Branch label="Lectura" done={ready&&state.read.includes(week.id)} active={path===base&&(!hash||hash.startsWith('#chapter-'))}>
      {week.chapters.map((title,index)=>destination(`${base}#chapter-${index}`,`CAPÍTULO ${String(index+1).padStart(2,'0')} · ${title}`,state.readingSections[String(week.id)]?.includes(index)))}
      {destination(`${base}#chapter-${week.chapters.length}`,`Práctica guiada · ${week.guided}`,state.readingSections[String(week.id)]?.includes(week.chapters.length))}
     </Branch>}
     {destination(`${base}#practical-exercise`,'Práctica',practiceCompleted(state.evidence,week.id))}
     {!week.foundation&&destination(`${base}#self-check`,'Autoevaluación',state.lessonChecks.includes(week.id))}
     {!week.foundation&&week.id===module.weeks.at(-1)?.id&&destination(closingTestHref(module.id)??`/modules/${module.id}`,'Test de cierre del curso',(state.quizzes[module.id]??0)>=QUIZ_PASS_PERCENT)}
    </Branch>;
   })}
   <Branch label="Practica con herramientas reales" active={module.weeks.some(w=>path===`/practice/${w.id}`)}>
    {module.weeks.map(week=>destination(`/practice/${week.id}`,`Ejercicio · semana ${week.id}`,practiceCompleted(state.evidence,week.id)))}
   </Branch>

  </Branch>;
 })}
 </Branch></div>;
}
