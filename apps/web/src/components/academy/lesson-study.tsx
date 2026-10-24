"use client";
import Link from 'next/link';
import {useState} from 'react';
import {useReadingTracker} from '@/features/progress/use-reading-tracker';
import {LearningEvidence} from './learning-evidence';
import {QUIZ_PASS_PERCENT,weekRequirements} from '@qapath/progress';
import {useProgress} from '@/features/progress/progress-provider';
import type {Week,StudyGuide} from '@qapath/contracts';
export function LessonStudy({week,guide}:{week:Week;guide:StudyGuide}){
 const {state,ready,recordLearning,saveNote,flushNote,remote}=useProgress();const [showSolution,setShowSolution]=useState(false);const [selected,setSelected]=useState<number|null>(null);
 const read=state.read.includes(week.id);const complete=state.weeks.includes(week.id);
 const readingRoot=useReadingTracker(week.id);const rule=weekRequirements(week.id);
 const download=()=>{
  const md=[`# Semana ${week.id} · ${week.title}`,guide.summary,...guide.sections.map(s=>`## ${s.title}\n\n${s.body}\n\n${s.points.map(x=>'- '+x).join('\n')}`),`## Ejemplo: ${guide.example.title}\n\n${guide.example.context}\n\n${guide.example.steps.map((x,i)=>`${i+1}. ${x}`).join('\n')}`,...(guide.example.code?[`\n\`\`\`${guide.example.language||'text'}\n${guide.example.code}\n\`\`\``]:[]),`## Reto\n\n${guide.activity}\n\n## Respuesta orientativa\n\n${guide.answer}`,`## Error frecuente\n\n${guide.pitfall}`].join('\n\n');
  const url=URL.createObjectURL(new Blob([md],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`qapath-semana-${week.id}.md`;a.click();URL.revokeObjectURL(url);
 };
 return <><div className="breadcrumb"><Link href="/modules">Módulos</Link><span> / </span><Link href={`/modules/${week.module}`}>{week.module}</Link><span> / Semana {week.id}</span></div>
 <div className="page-heading"><div><p className="eyebrow">SEMANA {String(week.id).padStart(2,'0')} · {guide.level.toUpperCase()} · {guide.duration} MIN</p><h1>{week.title}</h1><p className="page-description">{week.goal}</p></div><button className="button button-outline" onClick={download}>↓ Descargar clase</button></div>
 <div className="study-grid"><div className="study-content" ref={readingRoot}><div className="lesson-intro">{guide.summary}</div>
 {guide.sections.map((s,i)=><section key={i} data-reading-section={i} data-reading-recorded={state.readingSections[String(week.id)]?.includes(i)??false} className="study-section"><div className="chapter-label">CAPÍTULO {String(i+1).padStart(2,'0')}</div><h2>{s.title}</h2><p>{s.body}</p><ul className="bullet-list">{s.points.map((x,j)=><li key={j}>{x}</li>)}</ul></section>)}
 <section data-reading-section={guide.sections.length} data-reading-recorded={state.readingSections[String(week.id)]?.includes(guide.sections.length)??false} className="study-section"><div className="chapter-label">PRÁCTICA GUIADA</div><h2>{guide.example.title}</h2><p>{guide.example.context}</p><ol className="number-list">{guide.example.steps.map((s,i)=><li key={i}>{s}</li>)}</ol>{guide.example.code&&<pre className="code-block"><code>{guide.example.code}</code></pre>}</section>
 <section className="study-section exercise"><div className="chapter-label">RETO DE APRENDIZAJE</div><h2>Tu turno de practicar</h2><p>{guide.activity}</p><button className="button button-outline" onClick={()=>setShowSolution(!showSolution)} aria-expanded={showSolution}>{showSolution?'Ocultar':'Ver'} respuesta orientativa</button>{showSolution&&<div className="answer-box">{guide.answer}</div>}</section>
 <section className="study-section"><div className="chapter-label">AUTOEVALUACIÓN</div><h2>{guide.question.q}</h2><div className="options">{guide.question.options.map((s,i)=><button key={i} className={'option '+(selected===i?'chosen':'')} disabled={!ready} onClick={()=>{setSelected(i);recordLearning({type:'lesson-answer',week:week.id,answer:i})}}>{s}</button>)}</div>{selected!==null&&<p className={selected===guide.question.correct?'feedback good':'feedback bad'}>{selected===guide.question.correct?'✓ ¡Bien! ':'Revisa la explicación: '}{guide.question.why}</p>}</section>
 <section className="study-section"><h2>Mis notas de estudio</h2><textarea className="notes" disabled={!ready} aria-label="Mis notas" placeholder="Escribe aquí tus conclusiones, dudas y evidencias..." value={state.notes[String(week.id)]??''} onChange={e=>saveNote(week.id,e.target.value)} onBlur={flushNote}/><p className="hint">{remote?'Guardadas en PostgreSQL para tu cuenta.':'Guardadas en este navegador. Crea una cuenta para sincronizarlas.'}</p></section>
 <div className="learning-checklist" aria-label="Requisitos de la semana"><h2>Tu avance se registra automáticamente</h2><ul>
 <li className={read?'done':''} role="status">{read?'✓ Lectura registrada':'○ Lectura en curso: recorre los capítulos y el ejemplo guiado con la pestaña activa.'}</li>
 <li className={state.lessonChecks.includes(week.id)?'done':''}>{state.lessonChecks.includes(week.id)?'✓':'○'} Autoevaluación de la clase correcta</li>
 <li className={week.tasks.every((_,i)=>state.tasks.includes(`${week.id}:${i}`))?'done':''}>{week.tasks.filter((_,i)=>state.tasks.includes(`${week.id}:${i}`)).length}/{week.tasks.length} entregables enviados</li>
 <li className={rule?.labs.every(id=>state.labs.includes(id))?'done':''}>{rule?.labs.filter(id=>state.labs.includes(id)).length}/{rule?.labs.length} laboratorios del módulo entregados</li>
 <li className={(state.quizzes[week.module]??0)>=QUIZ_PASS_PERCENT?'done':''}>Evaluación del módulo: {state.quizzes[week.module]??0}% (mínimo {QUIZ_PASS_PERCENT}%)</li>
 </ul><p className="learning-status">{complete?'✓ Semana completada automáticamente':'Completa los requisitos pendientes para terminar esta semana.'}</p><Link className="text-link" href={`/modules/${week.module}`}>Ir a laboratorios y evaluación del módulo ↗</Link></div>
 <div className="lesson-end">{week.id<24&&<Link href={`/study/${week.id+1}`} className="button button-primary">Siguiente semana ↗</Link>}</div>
 </div><aside className="study-aside"><div className="aside-card"><p className="eyebrow">EN ESTA CLASE</p>{guide.sections.map((s,i)=><div className="outline-row" key={i}><span>0{i+1}</span>{s.title}</div>)}<div className="outline-row">◎ Ejemplo guiado</div><div className="outline-row">◇ Ejercicio + evaluación</div></div><div className="aside-card"><p className="eyebrow">EVIDENCIA DE APRENDIZAJE</p><p>{week.evidence}</p><strong>Entregables</strong><div>{week.tasks.map((t,i)=><LearningEvidence key={i} kind="task" id={`${week.id}:${i}`} title={t}/>)}</div></div><div className="aside-card"><p className="eyebrow">PROFUNDIZA</p>{guide.links.map(([name,url],i)=><a className="resource-link" key={i} href={url} target="_blank" rel="noopener noreferrer">{name} ↗</a>)}<div className="hint">Error frecuente: {guide.pitfall}</div></div></aside></div>
 </>;
}
