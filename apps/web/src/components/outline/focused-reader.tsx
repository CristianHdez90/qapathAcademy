'use client';
import Link from 'next/link';
import {useCallback,useEffect,useMemo,useRef,useState,type MouseEvent} from 'react';
import type {OutlineGradeDTO,OutlineProgressDTO,PublicOutlineChapter,PublicOutlineWeek} from '@qapath/contracts';
import {OUTLINE_PASS_PERCENT} from '@qapath/contracts';
import {useAuth} from '@/features/auth/auth-provider';
import {ASK_LIA_EVENT} from '@/components/assistant/ask-lia';
import {publishReadingContext} from '@/features/assistant/reading-suggestions';
import {STUDY_MODE_EVENT} from '@/features/progress/use-focused-study-mode';
import {StudyDialog,STUDY_TOOL_EVENT,announceStudyTool} from '@/components/academy/study-dialog';
import {OutlineCardView} from './outline-card';
import {outlineHrefResolver} from './outline-links';
import '@/components/study/study.css';
import '@/components/academy/focused-study.css';
import '@/components/academy/course-study-menu.css';
import './outline.css';
type Step={kind:'card'|'quiz';week:PublicOutlineWeek;weekIndex:number;chapter:PublicOutlineChapter;chapterNumber:number;cardIndex:number};
type Tool='menu'|'index'|'assistant'|null;
export function outlineSteps(weeks:PublicOutlineWeek[]):Step[]{
 let chapterNumber=0;
 return weeks.flatMap((week,weekIndex)=>week.chapters.flatMap(chapter=>{chapterNumber++;const n=chapterNumber;return [...chapter.cards.map((_,cardIndex)=>({kind:'card' as const,week,weekIndex,chapter,chapterNumber:n,cardIndex})),...(chapter.quiz.length?[{kind:'quiz' as const,week,weekIndex,chapter,chapterNumber:n,cardIndex:-1}]:[])]}));
}
/** Posición inicial: ?card= (tarjeta exacta) o ?chapter= (primera tarjeta del capítulo). */
export function stepIndex(steps:Step[],target:{chapter?:string;card?:string}){
 const i=target.card?steps.findIndex(s=>s.kind==='card'&&s.chapter.cards[s.cardIndex]?.id===target.card):target.chapter?steps.findIndex(s=>s.chapter.id===target.chapter):0;
 return i>=0?i:0;
}
const EMPTY:OutlineProgressDTO={readCards:[],passedChapters:{}};
const plain=(event:MouseEvent)=>event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey;
const two=(n:number)=>String(n).padStart(2,'0');
/**
 * SPEC-CONTENT-330/331 · Lectura en modo enfocado (misma estructura que /study/N?view=focused):
 * sin barra lateral, una tarjeta a la vez (texto a la izquierda, gráficas a la derecha), minitest al cerrar cada capítulo
 * y barra inferior con «Menú», «Avance del curso» y MariBug. En la vista previa del editor no oculta la navegación del ADMIN.
 */
export function FocusedReader({courseTitle,courseHref,learnHref,weeks,initialChapter,initialCard,student=false,loadProgress,markRead,grade,preview=false}:{
 courseTitle:string;courseHref?:string;learnHref?:string;weeks:PublicOutlineWeek[];initialChapter?:string;initialCard?:string;student?:boolean;preview?:boolean;
 loadProgress?:()=>Promise<OutlineProgressDTO>;markRead?:(ids:string[])=>Promise<OutlineProgressDTO>;grade:(chapterId:string,answers:Record<string,number>)=>Promise<OutlineGradeDTO>;
}){
 const {user,loading}=useAuth();
 const steps=useMemo(()=>outlineSteps(weeks),[weeks]);
 const [progress,setProgress]=useState<OutlineProgressDTO>(EMPTY);
 const [rawIndex,setIndex]=useState(()=>stepIndex(steps,{chapter:initialChapter,card:initialCard}));
 // Si el contenido cambia (vista previa del editor) y la posición ya no existe, se usa la última tarjeta.
 const index=Math.min(rawIndex,Math.max(0,steps.length-1));
 const [tool,setTool]=useState<Tool>(null);
 const [answers,setAnswers]=useState<Record<string,number>>({}),[result,setResult]=useState<OutlineGradeDTO|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const top=useRef<HTMLHeadingElement>(null);
 const step=steps[index];
 const base=learnHref??'#';
 // Un enlace del índice o de otra tarjeta (?chapter= / ?card=) cambia la posición sin recargar (ajuste durante el render).
 const target=`${initialChapter??''}|${initialCard??''}`,[lastTarget,setLastTarget]=useState(target);
 if(lastTarget!==target){setLastTarget(target);setIndex(stepIndex(steps,{chapter:initialChapter,card:initialCard}))}
 useEffect(()=>{if(!student||!loadProgress)return;let alive=true;void loadProgress().then(p=>{if(alive)setProgress(p)}).catch(()=>{});return()=>{alive=false}},[student,loadProgress]);
 // Modo enfocado: la barra lateral se oculta (CSS .focused-study) y MariBug se abre como diálogo de estudio.
 useEffect(()=>{
  if(preview)return;
  window.dispatchEvent(new Event(STUDY_MODE_EVENT));
  const sync=(event:Event)=>setTool((event as CustomEvent<{tool:Tool}>).detail.tool);
  window.addEventListener(STUDY_TOOL_EVENT,sync);return()=>{window.removeEventListener(STUDY_TOOL_EVENT,sync);window.dispatchEvent(new Event(STUDY_MODE_EVENT))};
 },[preview]);
 const card=step?.kind==='card'?step.chapter.cards[step.cardIndex]:undefined;
 const topic=card?.title??(step?`Minitest · ${step.chapter.title}`:'');
 const prompt=`Estoy estudiando «${topic}» del curso ${courseTitle}. Explícamelo con un ejemplo de QA.`;
 const hints=useMemo<[string,string][]>(()=>[['Explícalo con otras palabras',`Explícame «${topic}» con otras palabras y un ejemplo.`],['Dame un ejemplo real',`Dame un ejemplo real de QA sobre «${topic}».`],['Hazme una pregunta',`Hazme una pregunta de práctica sobre «${topic}».`]],[topic]);
 useEffect(()=>{if(step)publishReadingContext({topic,week:step.weekIndex+1,prompt,suggestions:hints})},[step,topic,prompt,hints]);
 const go=useCallback((next:number)=>{
  if(next<0||next>=steps.length)return;
  if(card&&student&&markRead&&!progress.readCards.includes(card.id))void markRead([card.id]).then(setProgress).catch(()=>{});
  else if(card&&!student)setProgress(p=>p.readCards.includes(card.id)?p:{...p,readCards:[...p.readCards,card.id]});
  setIndex(next);setAnswers({});setResult(null);setError('');setTool(null);if(!preview)announceStudyTool(null);requestAnimationFrame(()=>top.current?.focus());
 },[steps.length,card,student,markRead,progress.readCards,preview]);
 const goTo=useCallback((target:{chapter?:string;card?:string})=>go(stepIndex(steps,target)),[go,steps]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(tool||(e.target as HTMLElement)?.closest?.('input,textarea,select,dialog'))return;if(e.key==='ArrowRight')go(index+1);if(e.key==='ArrowLeft')go(index-1)};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[go,index,tool]);
 const resolveHref=useMemo(()=>outlineHrefResolver(base,weeks,step?.week.id),[base,weeks,step?.week.id]);
 if(!step)return <div className={preview?'outline-reader':'focused-study outline-reader'}><p className="course-empty">Este curso aún no tiene tarjetas.</p>{courseHref&&<Link className="text-link" href={courseHref}>← Volver al curso</Link>}</div>;
 const totalCards=steps.filter(s=>s.kind==='card').length,readCount=new Set(progress.readCards).size,percent=totalCards?Math.round(Math.min(readCount,totalCards)*100/totalCards):0;
 const chapterSteps=steps.filter(s=>s.chapter.id===step.chapter.id),position=chapterSteps.indexOf(step)+1;
 const passed=(chapter:PublicOutlineChapter)=>(progress.passedChapters[chapter.id]??-1)>=OUTLINE_PASS_PERCENT;
 const chapterDone=(chapter:PublicOutlineChapter)=>chapter.cards.every(c=>progress.readCards.includes(c.id))&&(!chapter.quiz.length||passed(chapter));
 const submit=async()=>{setBusy(true);setError('');try{const r=await grade(step.chapter.id,answers);setResult(r);if(r.passed)setProgress(p=>({...p,passedChapters:{...p.passedChapters,[step.chapter.id]:Math.max(r.percent,p.passedChapters[step.chapter.id]??0)}}))}catch(e){setError(e instanceof Error?e.message:'No se pudo calificar.')}finally{setBusy(false)}};
 const close=()=>{setTool(null);if(!preview)announceStudyTool(null)};
 const open=(next:'menu'|'index')=>{if(!preview)announceStudyTool(next);setTool(next)};
 const askMariBug=()=>{if(!preview)announceStudyTool('assistant');window.dispatchEvent(new CustomEvent(ASK_LIA_EVENT,{detail:{prompt,preserveDraft:true,topic,week:step.weekIndex+1,suggestions:hints}}))};
 // Enlaces internos dentro de la tarjeta (?chapter= / ?card=): se navega en el mismo lector.
 const followInternal=(event:MouseEvent)=>{
  const anchor=(event.target as HTMLElement).closest?.('a.study-internal-link') as HTMLAnchorElement|null;if(!anchor||!plain(event))return;
  const url=new URL(anchor.href,location.href),chapter=url.searchParams.get('chapter')??undefined,target=url.searchParams.get('card')??undefined;if(!chapter&&!target)return;
  event.preventDefault();goTo({chapter,card:target});if(!preview&&learnHref)history.replaceState(history.state,'',`${learnHref}${url.search}`);
 };
 const stepLabel=(s:Step)=>s.kind==='quiz'?`Minitest · ${s.chapter.title}`:s.chapter.cards[s.cardIndex].title;
 return <div className={preview?'outline-reader':'focused-study outline-reader'} data-outline-reader>
  <header className="focused-header">{courseHref?<Link href={courseHref} className="text-link">← Volver al curso</Link>:<span/>}{preview&&<p className="outline-preview-flag">VISTA PREVIA · el avance no se guarda</p>}
   <div><p className="eyebrow">SEMANA {two(step.weekIndex+1)} · {step.week.title.toUpperCase()}</p><h1>{courseTitle}</h1></div>
   <p className="focused-navigation-status" aria-live="polite" aria-atomic="true">Capítulo {two(step.chapterNumber)} · {step.chapter.title} · paso {position} de {chapterSteps.length} · {percent}% del curso leído</p>
   <progress aria-label="Avance del curso" value={percent} max={100}/></header>
  <section className="focused-card" aria-labelledby="outline-step-title" onClickCapture={followInternal}>
   <p className="chapter-label">CAPÍTULO {two(step.chapterNumber)} · {position} / {chapterSteps.length}</p>
   {card?<><h2 id="outline-step-title" ref={top} tabIndex={-1}>{card.title}</h2><OutlineCardView card={card} resolveHref={resolveHref}/></>
   :<><h2 id="outline-step-title" ref={top} tabIndex={-1}>Minitest · {step.chapter.title}</h2><p>Responde las preguntas. Apruebas con {OUTLINE_PASS_PERCENT} % o más; puedes repetirlo.</p>
    <form className="outline-quiz" onSubmit={e=>{e.preventDefault();void submit()}}>
     {step.chapter.quiz.map((q,qi)=>{const fb=result?.feedback.find(f=>f.questionId===q.id);return <fieldset key={q.id} className={fb?(fb.correct?'is-correct':'is-wrong'):undefined}><legend>{qi+1}. {q.question}</legend>
      {q.options.map((option,oi)=><label key={oi}><input type="radio" name={q.id} checked={answers[q.id]===oi} disabled={!!result} onChange={()=>setAnswers(a=>({...a,[q.id]:oi}))}/>{option}</label>)}
      {fb&&<p className="outline-feedback" role="status">{fb.correct?'✓ Correcto.':`✗ La respuesta correcta es «${q.options[fb.expected]}».`} {fb.explanation}</p>}</fieldset>})}
     {error&&<p role="alert" className="feedback bad">{error}</p>}
     {result?<div className={`feedback ${result.passed?'good':'bad'}`} role="status"><strong>{result.percent}% · {result.score}/{result.total}</strong> {result.passed?'¡Capítulo aprobado!':`Necesitas ${OUTLINE_PASS_PERCENT} % para aprobar.`} <button type="button" className="button button-outline" onClick={()=>{setResult(null);setAnswers({})}}>Repetir minitest</button></div>
      :<button className="button button-primary" disabled={busy||Object.keys(answers).length<step.chapter.quiz.length}>{busy?'Calificando…':'Calificar minitest'}</button>}
    </form></>}
  </section>
  <nav className="focused-pager" aria-label="Navegación por tarjetas"><button type="button" className="button button-outline" disabled={index===0} onClick={()=>go(index-1)}>← Anterior</button><span aria-hidden="true">{index+1} / {steps.length}</span>
   {index<steps.length-1?<button type="button" className="button button-primary" onClick={()=>go(index+1)}>{steps[index+1].kind==='quiz'?'Ir al minitest →':steps[index+1].chapter.id!==step.chapter.id?'Siguiente capítulo →':'Siguiente →'}</button>
   :courseHref?<Link className="button button-primary" href={courseHref} onClick={()=>{if(card&&student&&markRead)void markRead([card.id]).catch(()=>{})}}>Terminar ✓</Link>:<span/>}</nav>
  {!student&&!preview&&<aside className="focused-reading-note" aria-label="Estado de lectura"><p>{user?'Tu avance se guarda con una cuenta de estudiante.':'Lectura libre'}</p><p>{user?'Como administrador o instructor puedes recorrer y calificar el contenido sin registrar avance.':'Inicia sesión como estudiante para guardar las tarjetas leídas y tus minitests.'}</p></aside>}
  <nav className="focused-tools" aria-label="Herramientas de estudio">
   <button type="button" aria-haspopup="dialog" aria-expanded={tool==='menu'} onClick={event=>{event.currentTarget.focus();open('menu')}}><span aria-hidden="true">☰</span>Menú</button>
   <button type="button" aria-haspopup="dialog" aria-expanded={tool==='index'} onClick={event=>{event.currentTarget.focus();open('index')}}><span aria-hidden="true">☷</span>Avance del curso</button>
   <button type="button" disabled={loading} aria-haspopup="dialog" aria-expanded={tool==='assistant'} onClick={event=>{event.currentTarget.focus();askMariBug()}}><span aria-hidden="true">🐞</span>MariBug</button>
  </nav>
  <StudyDialog open={tool==='menu'} title="Menú del curso" onClose={close}>{tool==='menu'&&<div className="course-study-menu">
   <nav aria-label="Contenido del curso"><details open className="course-menu-root"><summary>Curso · {courseTitle}</summary>
    {courseHref&&<Link className="course-menu-button course-menu-wide" href={courseHref} onClick={close}>Vista del curso ↗</Link>}
    {weeks.map((week,wi)=>{const current=wi===step.weekIndex,first=week.chapters[0],done=!!week.chapters.length&&week.chapters.every(chapterDone);
     return <div key={week.id} className={`course-menu-week${current?' is-current':''}`}>
      <div className="course-menu-row"><a className="course-menu-button" href={first?`${base}?chapter=${first.id}`:base} aria-current={current?'page':undefined} onClick={event=>{if(first&&plain(event)){event.preventDefault();goTo({chapter:first.id})}}}>{done&&<span className="course-menu-done" aria-label="Semana completada">✓</span>}Semana {wi+1} · lectura ↗</a></div>
      {current&&<p className="course-menu-here">Estás aquí · {week.title}</p>}
      <ol className="course-menu-chapters">{week.chapters.map(chapter=>{const n=steps.find(s=>s.chapter.id===chapter.id)?.chapterNumber??0;
       return <li key={chapter.id}><a href={`${base}?chapter=${chapter.id}`} aria-current={chapter.id===step.chapter.id?'step':undefined} onClick={event=>{if(plain(event)){event.preventDefault();goTo({chapter:chapter.id})}}}>Capítulo {two(n)} · {chapter.title}</a>{chapterDone(chapter)&&<span className="course-menu-done" aria-label="Completado">✓</span>}</li>})}</ol>
     </div>})}
    <p className="course-menu-progress">Avance del curso: <strong>{percent}%</strong></p>
   </details></nav>
   <nav aria-label="Plataforma" className="course-menu-platform"><Link className="course-menu-link" href="/courses" onClick={close}><span aria-hidden="true">◫</span>Todos los cursos</Link>{!loading&&(user?<Link className="course-menu-link" href="/account" onClick={close}><span aria-hidden="true">☻</span>Mi cuenta</Link>:<Link className="course-menu-link" href="/login" onClick={close}><span aria-hidden="true">☻</span>Entrar / Crear cuenta ↗</Link>)}</nav>
  </div>}</StudyDialog>
  <StudyDialog open={tool==='index'} title="Avance del curso" onClose={close}>{tool==='index'&&<>
   <section className="course-progress-panel" aria-label={`Avance del curso ${courseTitle}`}>
    <p className="eyebrow">CURSO · {courseTitle.toUpperCase()}</p>
    <div className="course-progress-summary"><strong>{percent}%</strong><span>{Math.min(readCount,totalCards)} de {totalCards} tarjetas leídas</span></div>
    <div className="progress-line" role="progressbar" aria-label="Avance del curso" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><i style={{width:`${percent}%`}}/></div>
    <ol className="course-progress-weeks">{weeks.map((week,wi)=>{const cards=week.chapters.flatMap(c=>c.cards),read=cards.filter(c=>progress.readCards.includes(c.id)).length,complete=!!week.chapters.length&&week.chapters.every(chapterDone),started=complete||read>0||week.chapters.some(c=>progress.passedChapters[c.id]!==undefined);
     const quizzes=week.chapters.filter(c=>c.quiz.length),approved=quizzes.filter(passed).length;
     return <li key={week.id} className={wi===step.weekIndex?'is-current':''}><span className={`course-progress-state ${complete?'done':started?'started':''}`} aria-hidden="true">{complete?'✓':started?'◔':'○'}</span><div><strong>Semana {wi+1} · {week.title}</strong><small>{complete?'Completada':started?'En curso':'Sin iniciar'} · {read}/{cards.length} tarjetas leídas{quizzes.length?` · Minitests ${approved}/${quizzes.length}`:''}{wi===step.weekIndex?' · Estás aquí':''}</small></div></li>})}</ol>
    {!student&&!preview&&<p className="hint">Inicia sesión como estudiante para guardar tu avance.</p>}
   </section>
   <h3 className="course-progress-index-title">En este capítulo</h3><p className="hint">El índice cambia tu posición; no completa actividades.</p>
   <nav aria-label="Índice de tarjetas">{chapterSteps.map(item=>{const i=steps.indexOf(item),id=item.kind==='card'?item.chapter.cards[item.cardIndex].id:undefined;
    return <a key={i} href={id?`${base}?card=${id}`:`${base}?chapter=${item.chapter.id}`} className="focused-index-row" aria-current={i===index?'step':undefined} onClick={event=>{if(plain(event)){event.preventDefault();go(i)}}}><span>{chapterSteps.indexOf(item)+1}</span>{id&&progress.readCards.includes(id)?'✓ ':''}{stepLabel(item)}{i===index&&<small>Actual</small>}</a>})}</nav>
  </>}</StudyDialog>
 </div>;
}
