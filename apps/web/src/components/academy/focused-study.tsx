'use client';
import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import type {Week,StudyGuide} from '@qapath/contracts';
import {useAuth} from '@/features/auth/auth-provider';
import {useProgress} from '@/features/progress/progress-provider';
import {studySteps} from '@/features/progress/study-steps';
import {useStudyNavigation} from '@/features/progress/use-study-navigation';
import {STUDY_MODE_EVENT} from '@/features/progress/use-focused-study-mode';
import {ASK_LIA_EVENT} from '@/components/assistant/ask-lia';
import {CourseStudyMenu,CourseProgressPanel} from './course-study-menu';
import courseTree from '@/features/navigation/learning-tree.json';
import {stepSuggestions,publishReadingContext} from '@/features/assistant/reading-suggestions';
import {ReadingConcepts} from './reading-concepts';
import {ReadingReference} from './reading-reference';
import {useFocusedReading} from '@/features/progress/use-focused-reading';
import {LearningSteps} from './learning-steps';
import {PracticalExercisePanel} from './practical-exercise';
import {SaveFeedback} from './save-feedback';
import {StudyDialog,STUDY_TOOL_EVENT,announceStudyTool} from './study-dialog';
import {downloadLesson} from './lesson-download';
import {ChapterExperience} from './chapter-experience';
import {ConceptDetailsFallback} from './concept-details-fallback';
import {Quiz} from './quiz';
import {closingTestHref} from '@/features/progress/learning-navigation';

type Tool='menu'|'index'|'assistant'|null;
export function FocusedStudy({week,guide}:{week:Week;guide:StudyGuide}){
 const {user,loading}=useAuth();const {state,ready,remote,recordLearning,saveNote,flushNote}=useProgress();
 const steps=useMemo(()=>studySteps(guide),[guide]);
 const {active,go,notice,root}=useStudyNavigation(week.id,`${user?.id||'guest'}:${user?.role||'guest'}`,steps,flushNote,!loading);
 const [tool,setTool]=useState<Tool>(null),[selected,setSelected]=useState<number|null>(null);
 const index=Math.max(0,steps.findIndex(step=>step.id===active)),step=steps[index];
 const source=step.chapter===guide.sections.length?guide.example:step.chapter!==undefined?guide.sections[step.chapter]:undefined;
 const concept=step.concept!==undefined?source?.concepts?.[step.concept]:undefined;
 const {blueprint:readingBlueprint,region:readingRegion,plan:readingPlan,verified:readingVerified,diagnostic:readingDiagnostic}=useFocusedReading(week.id,step,'static-concepts');
 const read=state.read.includes(week.id),complete=state.weeks.includes(week.id);
 const recorded=state.readingSections[String(week.id)]||[];
 const readingKey=`reading:${week.id}:${step.chapter}`;
 const close=()=>{setTool(null);announceStudyTool(null)};
 useEffect(()=>{
  window.dispatchEvent(new Event(STUDY_MODE_EVENT));
  const sync=(event:Event)=>setTool((event as CustomEvent<{tool:Tool}>).detail.tool);
  window.addEventListener(STUDY_TOOL_EVENT,sync);return()=>{window.removeEventListener(STUDY_TOOL_EVENT,sync);window.dispatchEvent(new Event(STUDY_MODE_EVENT))};
 },[]);
 const open=(next:'menu'|'index')=>{announceStudyTool(next);setTool(next)};
 const navigate=(id:string)=>{close();go(id)};
 const chapterHash=step.chapter!==undefined?`chapter-${step.chapter}`:'chapter-0';
 const courseTitle=courseTree.find(item=>item.id===week.module)?.title??week.module;
 const readingHints=stepSuggestions(courseTitle,week.id,step.title,concept?.description??(source&&'body' in source?source.body:undefined));
 const readingPrompt=`Estoy estudiando el curso «${courseTitle}», semana ${week.id}: ${step.title}. Ayúdame a comprender este tema con un ejemplo de QA y una pregunta de práctica.`;
 useEffect(()=>{publishReadingContext({topic:step.title,week:week.id,prompt:readingPrompt,suggestions:readingHints})},[step.id,week.id]);// eslint-disable-line react-hooks/exhaustive-deps
 return <div className="focused-study" data-study-week={week.id}>
  <header className="focused-header"><Link href={`/courses/${week.module}`} className="text-link">← Volver al curso</Link><button type="button" className="button button-outline" onClick={()=>downloadLesson(week,guide)}>↓ Descargar clase</button><div><p className="eyebrow">SEMANA {String(week.id).padStart(2,'0')} · {guide.level} · {guide.duration} MIN</p><h1>{week.title}</h1></div><p className="focused-navigation-status" aria-live="polite" aria-atomic="true">Tarjeta {index+1} de {steps.length} · {step.title}</p><progress aria-label="Posición en la clase, no progreso académico" value={index+1} max={steps.length}/></header>
  {notice&&<p role="status" className="feedback bad">{notice}</p>}
  <section ref={root} className="focused-card" data-study-step={step.id} aria-labelledby="focused-step-title">
   <p className="chapter-label">{step.chapter===guide.sections.length?'EJEMPLO GUIADO':step.chapter!==undefined?`CAPÍTULO ${step.chapter+1}`:'TU RECORRIDO'} · {index+1} / {steps.length}</p>
   <h2 id="focused-step-title" data-study-title tabIndex={-1}>{step.kind==='check'?guide.question.q:step.title}</h2>
   {step.kind==='intro'&&<><p className="focused-lead">{guide.summary}</p><p>{week.goal}</p><LearningSteps week={week.id} focused/><div className="focused-callout"><strong>Un concepto a la vez</strong><p>Avanza a tu ritmo o elige una tarjeta en «En esta clase». La posición en el recorrido es independiente de tu progreso académico.</p></div></>}
   {step.chapter!==undefined&&<div className="lesson-page reading-source" ref={readingRegion} data-reading-layout={concept?'reflow':'original'} data-reading-ready={ready} data-reading-verified={readingVerified} data-reading-diagnostic={readingDiagnostic} data-source-range={readingPlan?[readingPlan.piece.start,readingPlan.piece.end,readingPlan.geometry.height].join(','):undefined} style={{width:concept?'100%':readingPlan?.piece.width,height:concept?undefined:readingPlan?readingPlan.piece.end-readingPlan.piece.start:undefined,'--source-content-height':concept?undefined:readingPlan?readingPlan.piece.contentHeight+'px':undefined} as React.CSSProperties}>
    <div data-source-content style={{transform:readingPlan?`translateY(${readingPlan.offset}px)`:undefined}}><section className="study-section" style={{paddingTop:step.kind==='chapter'?undefined:0,paddingBottom:0,border:0}}>
     {step.kind==='chapter'&&<><div className="chapter-label">{step.chapter===guide.sections.length?'PRÁCTICA GUIADA':`CAPÍTULO ${String(step.chapter+1).padStart(2,'0')}`}</div><h2>{source!.title}</h2><p>{step.chapter===guide.sections.length?guide.example.context:guide.sections[step.chapter].body}</p></>}
     {concept&&<ReadingConcepts key={step.id} concepts={[concept]}/>}
     {step.kind==='points'&&<ul className="bullet-list" data-source-tail>{guide.sections[step.chapter].points.map((point,i)=><li key={i}>{point}</li>)}</ul>}
     {step.kind==='steps'&&<ol className="number-list" data-source-tail>{guide.example.steps.map((item,i)=><li key={i}>{item}</li>)}</ol>}
     {step.kind==='code'&&<pre className="code-block" data-source-tail tabIndex={0} aria-label={`Código ${guide.example.language||''}`}><code>{guide.example.code}</code></pre>}
    </section></div>
   </div>}
   {step.kind==='chapter'&&step.chapter!==undefined&&guide.sections[step.chapter]?.experience&&<ChapterExperience key={step.id} experience={guide.sections[step.chapter].experience!}/>}
   {step.kind==='exercise'&&guide.exercise&&<PracticalExercisePanel week={week.id} exercise={guide.exercise}/>}
   {step.kind==='check'&&<><div className="options">{guide.question.options.map((option,i)=><button key={i} className={`option ${selected===i?'chosen':''}`} aria-pressed={selected===i} disabled={!ready} onClick={()=>{setSelected(i);void recordLearning({type:'lesson-answer',week:week.id,answer:i})}}>{option}</button>)}</div>{selected!==null&&<p className={`feedback ${selected===guide.question.correct?'good':'bad'}`} role="status">{selected===guide.question.correct?'✓ ¡Bien! ':'Revisa la explicación: '}{guide.question.why}</p>}<SaveFeedback actionKey={`lesson:${week.id}`}/></>}
   {step.kind==='closing'&&guide.closingTest&&<Quiz moduleId={guide.closingTest.moduleId} questions={guide.closingTest.questions} eyebrow="TEST DE CIERRE DEL CURSO" title={guide.closingTest.moduleTitle}/>}
   {step.kind==='notes'&&<><label className="notes-label">Mis notas<textarea className="notes" aria-label="Mis notas" disabled={!ready} value={state.notes[String(week.id)]??''} onChange={event=>saveNote(week.id,event.target.value)} onBlur={flushNote} placeholder="Conclusiones, dudas e ideas para practicar…"/></label><SaveFeedback actionKey={`note:${week.id}`}/><p className="hint">{remote?'Guardado automático en tu cuenta.':'Guardado en este navegador. Crea una cuenta para sincronizar tus notas.'}</p></>}
   {step.kind==='resources'&&<><div className="lesson-resources">{guide.links.map(([name,url],i)=><a className="resource-link" key={i} href={url} target="_blank" rel="noopener noreferrer">{name} ↗</a>)}</div><p className="focused-callout">Error frecuente: {guide.pitfall}</p></>}
   {step.kind==='finish'&&<><p>Terminaste el recorrido de tarjetas. Revisa tus actividades pendientes para completar la semana.</p><LearningSteps week={week.id} focused/><p className="learning-status">{complete?'✓ Semana completada automáticamente':'La semana se completa al cumplir las cuatro etapas.'}</p><Link className="button button-primary" href={closingTestHref(week.module)??`/modules/${week.module}`}>Ir al test de cierre ↗</Link>{week.id<24&&<Link className="button button-outline" href={`/study/${week.id+1}?view=focused`}>Siguiente semana ↗</Link>}</>}
  </section>
  <nav className="focused-pager" aria-label="Navegación por tarjetas"><button type="button" className="button button-outline" disabled={index===0} onClick={()=>go(steps[index-1].id)}>← Anterior</button><span aria-hidden="true">{index+1} / {steps.length}</span>{index<steps.length-1?<button type="button" className="button button-primary" onClick={()=>go(steps[index+1].id)}>Siguiente →</button>:<Link className="button button-primary" href={`/courses/${week.module}`}>Volver al curso ↗</Link>}</nav>
  <aside className="focused-reading-note" aria-label="Estado de lectura"><p>{read?'✓ Lectura registrada':`Lectura: ${recorded.length} de ${guide.sections.length+1} capítulos registrados`}</p>{!read&&<p>{step.chapter!==undefined&&!readingVerified?'Comprobando la presentación del contenido. Si la lectura no se registra, puedes usar la vista por capítulos.':'La lectura se registra al cubrir el contenido y cumplir el tiempo de atención. Avanzar por tarjetas no completa la lectura.'}</p>}{step.chapter!==undefined&&<SaveFeedback actionKey={readingKey}/>}<Link className="text-link" href={`/study/${week.id}#${chapterHash}`} onClick={flushNote}>Consultar vista anterior por capítulos ↗</Link></aside>
  {step.chapter!==undefined&&<div ref={readingBlueprint} hidden inert aria-hidden="true" data-reading-blueprint><ReadingReference guide={guide} chapter={step.chapter}/></div>}
  <ConceptDetailsFallback guide={guide}/>
  <nav className="focused-tools" aria-label="Herramientas de estudio"><button aria-haspopup="dialog" aria-expanded={tool==='menu'} onClick={event=>{event.currentTarget.focus();open('menu')}}><span aria-hidden="true">☰</span>Menú</button><button aria-haspopup="dialog" aria-expanded={tool==='index'} onClick={event=>{event.currentTarget.focus();open('index')}}><span aria-hidden="true">☷</span>Avance del curso</button><button disabled={loading} aria-haspopup="dialog" aria-expanded={tool==='assistant'} onClick={event=>{event.currentTarget.focus();announceStudyTool('assistant');window.dispatchEvent(new CustomEvent(ASK_LIA_EVENT,{detail:{prompt:readingPrompt,preserveDraft:true,topic:step.title,week:week.id,suggestions:readingHints}}))}}><span aria-hidden="true">🐞</span>MariBug</button></nav>
  <StudyDialog open={tool==='menu'} title="Menú del curso" onClose={close}>{tool==='menu'&&<CourseStudyMenu moduleId={week.module} week={week.id} onNavigate={close} onGo={id=>{close();go(id)}}/>}</StudyDialog>
  <StudyDialog open={tool==='index'} title="Avance del curso" onClose={close}>{tool==='index'&&<><CourseProgressPanel moduleId={week.module} week={week.id}/><h3 className="course-progress-index-title">En esta clase</h3><p className="hint">El índice cambia tu posición; no completa actividades.</p><nav aria-label="Índice de tarjetas">{steps.map((item,i)=><a href={`#${item.id}`} key={item.id} className="focused-index-row" aria-current={step.id===item.id?'step':undefined} onClick={event=>{if(event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){event.preventDefault();navigate(item.id)}}}><span>{i+1}</span>{item.title}{step.id===item.id&&<small>Actual</small>}</a>)}</nav></>}</StudyDialog>
 </div>;
}
