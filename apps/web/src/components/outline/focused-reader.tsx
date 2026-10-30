'use client';
import Link from 'next/link';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import type {OutlineGradeDTO,OutlineProgressDTO,PublicOutlineChapter,PublicOutlineWeek} from '@qapath/contracts';
import {OUTLINE_PASS_PERCENT} from '@qapath/contracts';
import {ASK_LIA_EVENT} from '@/components/assistant/ask-lia';
import {publishReadingContext} from '@/features/assistant/reading-suggestions';
import {OutlineCardView} from './outline-card';
import '@/components/study/study.css';
import '@/components/academy/focused-study.css';
import './outline.css';
type Step={kind:'card'|'quiz';week:PublicOutlineWeek;weekIndex:number;chapter:PublicOutlineChapter;cardIndex:number};
export function outlineSteps(weeks:PublicOutlineWeek[]):Step[]{
 return weeks.flatMap((week,weekIndex)=>week.chapters.flatMap(chapter=>[...chapter.cards.map((_,cardIndex)=>({kind:'card' as const,week,weekIndex,chapter,cardIndex})),...(chapter.quiz.length?[{kind:'quiz' as const,week,weekIndex,chapter,cardIndex:-1}]:[])]));
}
const EMPTY:OutlineProgressDTO={readCards:[],passedChapters:{}};
/**
 * SPEC-CONTENT-330 · Lectura en modo enfocado: una tarjeta a la vez (texto izquierda, gráficas derecha),
 * minitest al cerrar cada capítulo, Menú del curso, Avance del curso y MariBug.
 */
export function FocusedReader({courseTitle,courseHref,weeks,initialChapter,student=false,loadProgress,markRead,grade,preview=false}:{
 courseTitle:string;courseHref?:string;weeks:PublicOutlineWeek[];initialChapter?:string;student?:boolean;preview?:boolean;
 loadProgress?:()=>Promise<OutlineProgressDTO>;markRead?:(ids:string[])=>Promise<OutlineProgressDTO>;grade:(chapterId:string,answers:Record<string,number>)=>Promise<OutlineGradeDTO>;
}){
 const steps=useMemo(()=>outlineSteps(weeks),[weeks]);
 const [progress,setProgress]=useState<OutlineProgressDTO>(EMPTY);
 const [index,setIndex]=useState(()=>{const i=initialChapter?steps.findIndex(s=>s.chapter.id===initialChapter):0;return i>=0?i:0});
 const [tool,setTool]=useState<'menu'|'progress'|null>(null);
 const [answers,setAnswers]=useState<Record<string,number>>({}),[result,setResult]=useState<OutlineGradeDTO|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const top=useRef<HTMLHeadingElement>(null);
 const step=steps[index];
 useEffect(()=>{if(!student||!loadProgress)return;let alive=true;void loadProgress().then(p=>{if(alive)setProgress(p)}).catch(()=>{});return()=>{alive=false}},[student,loadProgress]);
 const card=step?.kind==='card'?step.chapter.cards[step.cardIndex]:undefined;
 // Contexto para MariBug: sugerencias sobre la tarjeta en foco.
 useEffect(()=>{if(!step)return;const topic=card?.title??`Minitest · ${step.chapter.title}`;
  publishReadingContext({topic,week:step.weekIndex+1,prompt:`Estoy estudiando «${topic}» del curso ${courseTitle}. Explícamelo con un ejemplo de QA.`,suggestions:[['Explícalo con otras palabras',`Explícame «${topic}» con otras palabras y un ejemplo.`],['Dame un ejemplo real',`Dame un ejemplo real de QA sobre «${topic}».`],['Hazme una pregunta',`Hazme una pregunta de práctica sobre «${topic}».`]]});
 },[step,card,courseTitle]);
 const go=useCallback((next:number)=>{
  if(next<0||next>=steps.length)return;
  if(card&&student&&markRead&&!progress.readCards.includes(card.id))void markRead([card.id]).then(setProgress).catch(()=>{});
  else if(card&&!student)setProgress(p=>p.readCards.includes(card.id)?p:{...p,readCards:[...p.readCards,card.id]});
  setIndex(next);setAnswers({});setResult(null);setError('');setTool(null);requestAnimationFrame(()=>top.current?.focus());
 },[steps.length,card,student,markRead,progress.readCards]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(tool||(e.target as HTMLElement)?.closest?.('input,textarea,select'))return;if(e.key==='ArrowRight')go(index+1);if(e.key==='ArrowLeft')go(index-1)};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[go,index,tool]);
 if(!step)return <section className="outline-reader"><p className="course-empty">Este curso aún no tiene tarjetas.</p></section>;
 const totalCards=steps.filter(s=>s.kind==='card').length,readCount=new Set(progress.readCards).size,percent=totalCards?Math.round(Math.min(readCount,totalCards)*100/totalCards):0;
 const chapterSteps=steps.filter(s=>s.chapter.id===step.chapter.id),position=chapterSteps.indexOf(step)+1;
 const submit=async()=>{setBusy(true);setError('');try{const r=await grade(step.chapter.id,answers);setResult(r);if(r.passed)setProgress(p=>({...p,passedChapters:{...p.passedChapters,[step.chapter.id]:Math.max(r.percent,p.passedChapters[step.chapter.id]??0)}}))}catch(e){setError(e instanceof Error?e.message:'No se pudo calificar.')}finally{setBusy(false)}};
 const askMariBug=()=>{const topic=card?.title??step.chapter.title;window.dispatchEvent(new CustomEvent(ASK_LIA_EVENT,{detail:{prompt:`Estoy estudiando «${topic}» del curso ${courseTitle}. Explícamelo con un ejemplo de QA.`,topic,week:step.weekIndex+1}}))};
 return <section className="outline-reader" aria-labelledby="outline-step-title">
  {courseHref&&<Link className="text-link" href={courseHref}>← Volver al curso</Link>}
  {preview&&<p className="outline-preview-flag">VISTA PREVIA · el avance no se guarda</p>}
  <p className="eyebrow">SEMANA {String(step.weekIndex+1).padStart(2,'0')} · {step.week.title}</p>
  <p className="outline-chapter-name">{step.chapter.title}</p>
  <p className="hint">Paso {position} de {chapterSteps.length} del capítulo · {percent}% del curso leído</p>
  <div className="outline-progress" role="progressbar" aria-label="Avance del curso" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><i style={{width:`${percent}%`}}/></div>
  <article className="outline-step">
   {card?<><h1 id="outline-step-title" ref={top} tabIndex={-1}>{card.title}</h1><OutlineCardView card={card}/></>
   :<><h1 id="outline-step-title" ref={top} tabIndex={-1}>Minitest · {step.chapter.title}</h1><p>Responde las preguntas. Apruebas con {OUTLINE_PASS_PERCENT} % o más; puedes repetirlo.</p>
    <form className="outline-quiz" onSubmit={e=>{e.preventDefault();void submit()}}>
     {step.chapter.quiz.map((q,qi)=>{const fb=result?.feedback.find(f=>f.questionId===q.id);return <fieldset key={q.id} className={fb?(fb.correct?'is-correct':'is-wrong'):undefined}><legend>{qi+1}. {q.question}</legend>
      {q.options.map((option,oi)=><label key={oi}><input type="radio" name={q.id} checked={answers[q.id]===oi} disabled={!!result} onChange={()=>setAnswers(a=>({...a,[q.id]:oi}))}/>{option}</label>)}
      {fb&&<p className="outline-feedback" role="status">{fb.correct?'✓ Correcto.':`✗ La respuesta correcta es «${q.options[fb.expected]}».`} {fb.explanation}</p>}</fieldset>})}
     {error&&<p role="alert" className="feedback bad">{error}</p>}
     {result?<div className={`feedback ${result.passed?'good':'bad'}`} role="status"><strong>{result.percent}% · {result.score}/{result.total}</strong> {result.passed?'¡Capítulo aprobado!':`Necesitas ${OUTLINE_PASS_PERCENT} % para aprobar.`} <button type="button" className="button button-outline" onClick={()=>{setResult(null);setAnswers({})}}>Repetir minitest</button></div>
      :<button className="button button-primary" disabled={busy||Object.keys(answers).length<step.chapter.quiz.length}>{busy?'Calificando…':'Calificar minitest'}</button>}
    </form></>}
  </article>
  <nav className="outline-nav" aria-label="Navegación de tarjetas"><button type="button" className="button button-outline" disabled={index===0} onClick={()=>go(index-1)}>← Anterior</button>
   {index<steps.length-1?<button type="button" className="button button-primary" onClick={()=>go(index+1)}>{steps[index+1].kind==='quiz'?'Ir al minitest →':steps[index+1].chapter.id!==step.chapter.id?'Siguiente capítulo →':'Siguiente →'}</button>
   :courseHref?<Link className="button button-primary" href={courseHref} onClick={()=>{if(card&&student&&markRead)void markRead([card.id]).catch(()=>{})}}>Terminar ✓</Link>:<span/>}</nav>
  <nav className="focused-tools" aria-label="Herramientas de estudio">
   <button type="button" aria-haspopup="dialog" aria-expanded={tool==='menu'} onClick={()=>setTool(t=>t==='menu'?null:'menu')}><span aria-hidden="true">☰</span>Menú</button>
   <button type="button" aria-haspopup="dialog" aria-expanded={tool==='progress'} onClick={()=>setTool(t=>t==='progress'?null:'progress')}><span aria-hidden="true">☷</span>Avance del curso</button>
   <button type="button" onClick={askMariBug}><span aria-hidden="true">🐞</span>MariBug</button>
  </nav>
  {tool&&<div className="outline-panel" role="dialog" aria-modal="false" aria-labelledby="outline-panel-title">
   <header><h2 id="outline-panel-title">{tool==='menu'?'Menú del curso':'Avance del curso'}</h2><button type="button" className="button button-outline" aria-label="Cerrar" onClick={()=>setTool(null)}>✕</button></header>
   {tool==='menu'?<ol className="outline-menu">{weeks.map((week,wi)=><li key={week.id}><strong>Semana {String(wi+1).padStart(2,'0')} · {week.title}</strong><ol>{week.chapters.map(chapter=><li key={chapter.id}><span>{chapter.title}{progress.passedChapters[chapter.id]!==undefined&&progress.passedChapters[chapter.id]>=OUTLINE_PASS_PERCENT?' ✓':''}</span><ol>{chapter.cards.map((c,ci)=>{const target=steps.findIndex(s=>s.chapter.id===chapter.id&&s.cardIndex===ci);return <li key={c.id}><button type="button" aria-current={target===index?'step':undefined} onClick={()=>go(target)}>{progress.readCards.includes(c.id)?'✓ ':''}{c.title}</button></li>})}
     {chapter.quiz.length>0&&<li><button type="button" aria-current={step.kind==='quiz'&&step.chapter.id===chapter.id?'step':undefined} onClick={()=>go(steps.findIndex(s=>s.kind==='quiz'&&s.chapter.id===chapter.id))}>Minitest ({chapter.quiz.length})</button></li>}</ol></li>)}</ol></li>)}</ol>
   :<div className="outline-stats"><p><strong>{percent}%</strong> del curso leído · {Math.min(readCount,totalCards)} de {totalCards} tarjetas</p><ul>{weeks.flatMap(w=>w.chapters).map(chapter=>{const read=chapter.cards.filter(c=>progress.readCards.includes(c.id)).length,best=progress.passedChapters[chapter.id];return <li key={chapter.id}><span>{chapter.title}</span><small>{read}/{chapter.cards.length} tarjetas{chapter.quiz.length?` · minitest ${best!==undefined?`${best}%${best>=OUTLINE_PASS_PERCENT?' ✓':''}`:'pendiente'}`:''}</small></li>})}</ul>{!student&&!preview&&<p className="hint">Inicia sesión como estudiante para guardar tu avance.</p>}</div>}
  </div>}
 </section>;
}
