'use client';
import Link from 'next/link';
import type {MouseEvent} from 'react';
import {foundationRules,foundationChapterPassed,practiceCompleted,progressPercentage} from '@qapath/progress';
import {useProgress} from '@/features/progress/progress-provider';
import {useAuth} from '@/features/auth/auth-provider';
import tree from '@/features/navigation/learning-tree.json';
import './course-study-menu.css';

type Go=(id:string)=>void;
const plain=(event:MouseEvent)=>event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey;

/** Capítulos de la semana actual: Fundamentos usa sus capítulos v2; el resto, los capítulos de la guía. */
function WeekChapters({moduleId,weekId,onGo}:{moduleId:string;weekId:number;onGo?:Go}){
 const {state,ready}=useProgress();
 const week=tree.find(item=>item.id===moduleId)?.weeks.find(item=>item.id===weekId);if(!week)return null;
 const items=week.foundation?week.foundation.map(chapter=>{const rule=foundationRules.find(item=>item.id===chapter.id);return {id:chapter.anchor,label:`Capítulo ${String(chapter.number).padStart(2,'0')} · ${chapter.title}`,done:ready&&!!rule&&foundationChapterPassed(state,rule)}})
  :week.chapters.map((title,index)=>({id:`chapter-${index}--intro`,label:`Capítulo ${String(index+1).padStart(2,'0')} · ${title}`,done:ready&&!!state.readingSections[String(weekId)]?.includes(index)}));
 return <ol className="course-menu-chapters">{items.map(item=><li key={item.id}><a href={`/study/${weekId}#${item.id}`} onClick={event=>{if(onGo&&plain(event)){event.preventDefault();onGo(item.id)}}}>{item.label}</a>{item.done&&<span className="course-menu-done" aria-label="Completado">✓</span>}</li>)}</ol>;
}

/** Menú de la lectura enfocada: contenido del curso en el que estás, tu posición y accesos directos. */
export function CourseStudyMenu({moduleId,week,onNavigate,onGo}:{moduleId:string;week:number;onNavigate:()=>void;onGo?:Go}){
 const {state,ready}=useProgress(),{user,loading}=useAuth();
 const course=tree.find(item=>item.id===moduleId);
 return <div className="course-study-menu">
  {course&&<nav aria-label="Contenido del curso"><details open className="course-menu-root"><summary>Curso · {course.title}</summary>
   <Link className="course-menu-button course-menu-wide" href={`/courses/${course.id}`} onClick={onNavigate}>Vista del curso ↗</Link>
   {course.weeks.map(item=>{const current=item.id===week,done=ready&&state.weeks.includes(item.id),practice=ready&&practiceCompleted(state.evidence,item.id);
    return <div key={item.id} className={`course-menu-week${current?' is-current':''}`}>
     <div className="course-menu-row"><Link className="course-menu-button" href={`/study/${item.id}`} aria-current={current?'page':undefined} onClick={event=>{if(current&&onGo&&plain(event)){event.preventDefault();onGo(item.foundation?`FND-W0${item.id}-intro`:'study-intro')}else onNavigate()}}>{done&&<span className="course-menu-done" aria-label="Semana completada">✓</span>}Semana {item.id} · lectura ↗</Link>
      <Link className="course-menu-button" href={`/study/${item.id}#practical-exercise`} onClick={event=>{if(current&&onGo&&plain(event)){event.preventDefault();onGo('practical-exercise')}else onNavigate()}}>{practice&&<span className="course-menu-done" aria-label="Práctica completada">✓</span>}Práctica ↗</Link></div>
     {current&&<><p className="course-menu-here">Estás aquí · {item.title}</p><WeekChapters moduleId={course.id} weekId={item.id} onGo={onGo}/></>}
    </div>})}
   {ready&&<p className="course-menu-progress">Avance del curso: <strong>{progressPercentage(state,course.weeks.map(item=>item.id))}%</strong></p>}
  </details></nav>}
  <nav aria-label="Plataforma" className="course-menu-platform"><Link className="course-menu-link" href="/courses" onClick={onNavigate}><span aria-hidden="true">◫</span>Todos los cursos</Link>{!loading&&(user?<Link className="course-menu-link" href="/account" onClick={onNavigate}><span aria-hidden="true">☻</span>Mi cuenta</Link>:<Link className="course-menu-link" href="/login" onClick={onNavigate}><span aria-hidden="true">☻</span>Entrar / Crear cuenta ↗</Link>)}</nav>
 </div>;
}

/** «Avance del curso»: progreso del curso completo y de cada semana; no completa actividades. */
export function CourseProgressPanel({moduleId,week}:{moduleId:string;week:number}){
 const {state,ready}=useProgress();
 const course=tree.find(item=>item.id===moduleId);if(!course)return null;
 const weeks=course.weeks.map(item=>item.id),pct=ready?progressPercentage(state,weeks):0,done=weeks.filter(id=>state.weeks.includes(id)).length;
 return <section className="course-progress-panel" aria-label={`Avance del curso ${course.title}`}>
  <p className="eyebrow">CURSO · {course.title.toUpperCase()}</p>
  <div className="course-progress-summary"><strong>{pct}%</strong><span>{done} de {weeks.length} semanas completadas</span></div>
  <div className="progress-line" role="progressbar" aria-label="Avance del curso" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><i style={{width:`${pct}%`}}/></div>
  <ol className="course-progress-weeks">{course.weeks.map(item=>{const complete=state.weeks.includes(item.id),started=complete||state.read.includes(item.id)||!!state.readingSections[String(item.id)]?.length||!!item.foundation?.some(chapter=>chapter.cards.some(card=>state.foundationCards?.[card.id]))||!!state.evidence[`exercise:${item.id}`];
   const cards=item.foundation?.flatMap(chapter=>chapter.cards)??[],read=cards.filter(card=>state.foundationCards?.[card.id]).length;
   return <li key={item.id} className={item.id===week?'is-current':''}><span className={`course-progress-state ${complete?'done':started?'started':''}`} aria-hidden="true">{complete?'✓':started?'◔':'○'}</span><div><strong>Semana {item.id} · {item.title}</strong><small>{complete?'Completada':started?'En curso':'Sin iniciar'}{cards.length?` · ${read}/${cards.length} tarjetas leídas`:''} · Práctica {practiceCompleted(state.evidence,item.id)?'validada':'pendiente'}{item.id===week?' · Estás aquí':''}</small></div></li>})}</ol>
 </section>;
}
