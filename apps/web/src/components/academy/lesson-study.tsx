"use client";
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {useReadingTracker} from '@/features/progress/use-reading-tracker';
import {LearningEvidence} from './learning-evidence';
import {LearningSteps} from './learning-steps';
import {LearningDisclosure} from './learning-disclosure';
import {SaveFeedback} from './save-feedback';
import {AskLia} from '@/components/assistant/ask-lia';
import {useProgress} from '@/features/progress/progress-provider';
import type {Week,StudyGuide} from '@qapath/contracts';

export function LessonStudy({week,guide}:{week:Week;guide:StudyGuide}){
 const {state,ready,recordLearning,saveNote,flushNote,remote}=useProgress();
 const [showSolution,setShowSolution]=useState(false),[selected,setSelected]=useState<number|null>(null),[active,setActive]=useState('chapter-0');
 const [helpTopic,setHelpTopic]=useState<string|null>(null);
 const read=state.read.includes(week.id),complete=state.weeks.includes(week.id);
 const readingRoot=useReadingTracker(week.id);
 const chapters=[...guide.sections.map((s,i)=>({id:`chapter-${i}`,title:s.title})),{id:`chapter-${guide.sections.length}`,title:'Ejemplo guiado'},{id:'practice',title:'Reto de aprendizaje'},{id:'deliverables',title:'Entregables'},{id:'self-check',title:'Autoevaluación'},{id:'study-notes',title:'Mis notas'}];
 const activeTopic=helpTopic||chapters.find(c=>c.id===active)?.title||week.title;
 useEffect(()=>{
  const root=readingRoot.current;if(!root)return;
  const observer=new IntersectionObserver(entries=>{
   const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
   if(visible[0])setActive(visible[0].target.id);
  },{rootMargin:'-12% 0px -62% 0px',threshold:0});
  root.querySelectorAll('[data-lesson-section]').forEach(section=>observer.observe(section));
  return()=>observer.disconnect();
 },[week.id,readingRoot]);
 const download=()=>{
  const md=[`# Semana ${week.id} · ${week.title}`,guide.summary,...guide.sections.map(s=>`## ${s.title}\n\n${s.body}\n\n${s.points.map(x=>'- '+x).join('\n')}`),`## Ejemplo: ${guide.example.title}\n\n${guide.example.context}\n\n${guide.example.steps.map((x,i)=>`${i+1}. ${x}`).join('\n')}`,...(guide.example.code?[`\n\`\`\`${guide.example.language||'text'}\n${guide.example.code}\n\`\`\``]:[]),`## Reto\n\n${guide.activity}\n\n## Respuesta orientativa\n\n${guide.answer}`,`## Error frecuente\n\n${guide.pitfall}`].join('\n\n');
  const url=URL.createObjectURL(new Blob([md],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`qapath-semana-${week.id}.md`;a.click();URL.revokeObjectURL(url);
 };
 return <div className="lesson-page"><nav className="breadcrumb" aria-label="Ruta de navegación"><Link href="/modules">Módulos</Link><span aria-hidden="true"> / </span><Link href={`/modules/${week.module}`}>{week.module}</Link><span aria-hidden="true"> / </span><span aria-current="page">Semana {week.id}</span></nav>
 <div className="page-heading"><div><p className="eyebrow">SEMANA {String(week.id).padStart(2,'0')} · {guide.level.toUpperCase()} · {guide.duration} MIN</p><h1>{week.title}</h1><p className="page-description">{week.goal}</p></div><button className="button button-outline" onClick={download}>↓ Descargar clase</button></div>
 <LearningSteps week={week.id}/>
 <div className="study-grid"><div className="study-content" ref={readingRoot}><div className="lesson-intro">{guide.summary}</div><p className="learning-read-status" role="status">{read?'✓ Lectura registrada':'Recorre los capítulos y el ejemplo: tu lectura se registra automáticamente.'}</p>
 {guide.sections.map((s,i)=><section id={`chapter-${i}`} tabIndex={-1} data-lesson-section key={i} data-reading-section={i} data-reading-recorded={state.readingSections[String(week.id)]?.includes(i)??false} className="study-section"><div className="chapter-label">CAPÍTULO {String(i+1).padStart(2,'0')}</div><h2>{s.title}</h2><p>{s.body}</p><ul className="bullet-list">{s.points.map((x,j)=><li key={j}>{x}</li>)}</ul></section>)}
 <section id={`chapter-${guide.sections.length}`} tabIndex={-1} data-lesson-section data-reading-section={guide.sections.length} data-reading-recorded={state.readingSections[String(week.id)]?.includes(guide.sections.length)??false} className="study-section"><div className="chapter-label">PRÁCTICA GUIADA</div><h2>{guide.example.title}</h2><p>{guide.example.context}</p><ol className="number-list">{guide.example.steps.map((s,i)=><li key={i}>{s}</li>)}</ol>{guide.example.code&&<pre className="code-block"><code>{guide.example.code}</code></pre>}</section>
 <section id="practice" tabIndex={-1} data-lesson-section className="study-section exercise"><div className="chapter-label">RETO DE APRENDIZAJE</div><h2>Tu turno de practicar</h2><p>{guide.activity}</p><button className="button button-outline" onClick={()=>setShowSolution(!showSolution)} aria-expanded={showSolution} aria-controls="suggested-answer">{showSolution?'Ocultar':'Ver'} respuesta orientativa</button>{showSolution&&<div id="suggested-answer" className="answer-box">{guide.answer}</div>}</section>
 <LearningDisclosure id="deliverables" title="Entregables de esta semana" description={`${week.tasks.filter((_,i)=>state.tasks.includes(`${week.id}:${i}`)).length} de ${week.tasks.length} enviados · Expande para adjuntar tu evidencia`}><p className="evidence-goal">{week.evidence}</p>{week.tasks.map((title,i)=><LearningEvidence key={i} kind="task" id={`${week.id}:${i}`} title={title}/>)}</LearningDisclosure>
 <section id="self-check" tabIndex={-1} data-lesson-section className="study-section"><div className="chapter-label">AUTOEVALUACIÓN</div><h2>{guide.question.q}</h2><div className="options">{guide.question.options.map((s,i)=><button key={i} className={'option '+(selected===i?'chosen':'')} aria-pressed={selected===i} disabled={!ready} onClick={()=>{setSelected(i);void recordLearning({type:'lesson-answer',week:week.id,answer:i})}}>{s}</button>)}</div>{selected!==null&&<p className={selected===guide.question.correct?'feedback good':'feedback bad'}>{selected===guide.question.correct?'✓ ¡Bien! ':'Revisa la explicación: '}{guide.question.why}</p>}<SaveFeedback actionKey={`lesson:${week.id}`}/></section>
 <LearningDisclosure id="study-notes" title="Mis notas de estudio" description="Anota conclusiones, dudas e ideas sin salir de la clase"><label className="notes-label">Mis notas<textarea className="notes" disabled={!ready} aria-label="Mis notas" placeholder="Escribe aquí tus conclusiones, dudas y evidencias..." value={state.notes[String(week.id)]??''} onChange={e=>saveNote(week.id,e.target.value)} onBlur={flushNote}/></label><SaveFeedback actionKey={`note:${week.id}`}/><p className="hint">{remote?'Guardado automático en tu cuenta.':'Guardado en este navegador. Crea una cuenta para sincronizar tus notas.'}</p></LearningDisclosure>
 <LearningDisclosure id="study-resources" title="Recursos para profundizar" description="Documentación oficial y un error frecuente que conviene evitar"><div className="lesson-resources">{guide.links.map(([name,url],i)=><a className="resource-link" key={i} href={url} target="_blank" rel="noopener noreferrer">{name} ↗</a>)}</div><p className="hint">Error frecuente: {guide.pitfall}</p></LearningDisclosure>
 <div className="lesson-completion"><p className="learning-status">{complete?'✓ Semana completada automáticamente':'Tu semana se completará al terminar las cinco etapas del recorrido.'}</p><Link className="text-link" href={`/modules/${week.module}#laboratories`}>Ir a laboratorios y evaluación del módulo ↗</Link></div>
 <div className="lesson-end">{week.id<24&&<Link href={`/study/${week.id+1}`} className="button button-outline">Siguiente semana ↗</Link>}</div>
 </div><aside className="study-aside"><nav className="aside-card lesson-outline" aria-label="Índice de la clase"><p className="eyebrow">EN ESTA CLASE</p>{chapters.map((chapter,i)=><a href={`#${chapter.id}`} key={chapter.id} className="outline-row" aria-current={active===chapter.id?'location':undefined} onClick={()=>{setActive(chapter.id);setHelpTopic(chapter.title);const target=document.getElementById(chapter.id);if(target instanceof HTMLDetailsElement)target.open=true}}><span aria-hidden="true">{String(i+1).padStart(2,'0')}</span>{chapter.title}</a>)}</nav><div className="aside-card contextual-help"><p className="eyebrow">TU ALIADA DE ESTUDIO</p><p>¿Una duda sobre <strong>{activeTopic}</strong>?</p><AskLia topic={activeTopic} week={week.id}/><small>MariBug prepara la pregunta; tú decides cuándo enviarla.</small></div></aside></div>
 </div>;
}
