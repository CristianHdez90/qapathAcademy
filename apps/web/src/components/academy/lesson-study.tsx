"use client";
import Link from 'next/link';
import {useState} from 'react';
import {useLessonPagination} from '@/features/progress/use-lesson-pagination';
import {LessonPagination} from './lesson-pagination';
import {useReadingTracker} from '@/features/progress/use-reading-tracker';
import {PracticalExercisePanel} from './practical-exercise';
import {ReadingConcepts} from './reading-concepts';


import {LearningSteps} from './learning-steps';
import {LearningDisclosure} from './learning-disclosure';
import {SaveFeedback} from './save-feedback';
import {AskLia} from '@/components/assistant/ask-lia';
import {useProgress} from '@/features/progress/progress-provider';
import type {Week,StudyGuide,ReadingConcept} from '@qapath/contracts';

function conceptMarkdown(c:ReadingConcept){return '### '+c.title+'\n\n'+c.description+(c.example?'\n\n**Ejemplo aplicado**\n\n- Situación: '+c.example.context+'\n- Qué hace QA: '+c.example.action+'\n- Resultado: '+c.example.result:'')+(c.demonstration?'\n\nSecuencia: '+c.demonstration.steps.join(' → '):'')}

export function LessonStudy({week,guide}:{week:Week;guide:StudyGuide}){
 const {state,ready,recordLearning,saveNote,flushNote,remote}=useProgress();
 const [selected,setSelected]=useState<number|null>(null);
 const read=state.read.includes(week.id),complete=state.weeks.includes(week.id);
 const readingRoot=useReadingTracker(week.id);
 const chapters=[...guide.sections.map((s,i)=>({id:`chapter-${i}`,title:s.title})),{id:`chapter-${guide.sections.length}`,title:'Práctica guiada'},...(guide.exercise?[{id:'practical-exercise',title:`Ejercicio práctico · ${guide.exercise.title}`}]:[]),{id:'self-check',title:'Autoevaluación'},{id:'study-notes',title:'Mis notas'},{id:'study-resources',title:'Recursos para profundizar'}];
 const {activeId:active,go}=useLessonPagination(week.id,chapters.map(chapter=>chapter.id));
 const activeTopic=chapters.find(c=>c.id===active)?.title||week.title;
 const download=()=>{
  const md=[`# Semana ${week.id} · ${week.title}`,guide.summary,...guide.sections.map(s=>`## ${s.title}\n\n${s.body}\n\n${(s.concepts||[]).map(conceptMarkdown).join('\n\n')}\n\n${s.points.map(x=>'- '+x).join('\n')}`),`## Ejemplo: ${guide.example.title}\n\n${guide.example.context}\n\n${guide.example.concepts?guide.example.concepts.map(conceptMarkdown).join('\n\n'):guide.example.steps.map((x,i)=>`${i+1}. ${x}`).join('\n')}`,...(guide.example.code?[`\n\`\`\`${guide.example.language||'text'}\n${guide.example.code}\n\`\`\``]:[]),`## Reto\n\n${guide.activity}\n\n## Respuesta orientativa\n\n${guide.answer}`,`## Error frecuente\n\n${guide.pitfall}`,...(guide.exercise?[`## Ejercicio práctico adicional: ${guide.exercise.title}\n\n${guide.exercise.objective}\n\n${guide.exercise.steps.map((step,i)=>`${i+1}. ${step.action}\n   Esperado: ${step.expected}`).join('\n')}\n\nEntregables: ${guide.exercise.deliverables.join('; ')}\n\nCriterios: ${guide.exercise.rubric.join('; ')}`]:[])].join('\n\n');
  const url=URL.createObjectURL(new Blob([md],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`qapath-semana-${week.id}.md`;a.click();URL.revokeObjectURL(url);
 };
 return <div className="lesson-page"><nav className="breadcrumb" aria-label="Ruta de navegación"><Link href="/modules">Módulos</Link><span aria-hidden="true"> / </span><Link href={`/modules/${week.module}`}>{week.module}</Link><span aria-hidden="true"> / </span><span aria-current="page">Semana {week.id}</span></nav>
 <div className="page-heading"><div><p className="eyebrow">SEMANA {String(week.id).padStart(2,'0')} · {guide.level.toUpperCase()} · {guide.duration} MIN</p><h1>{week.title}</h1><p className="page-description">{week.goal}</p></div><button className="button button-outline" onClick={download}>↓ Descargar clase</button></div>
 <LearningSteps week={week.id}/>
 <LessonPagination pages={chapters} activeId={active} onChange={go}/>
 <div className="study-grid"><div className="study-content" ref={readingRoot}><div className="lesson-intro">{guide.summary}</div><p className="learning-read-status" role="status">{read?'✓ Lectura registrada':'Recorre cada capítulo y el ejemplo hasta el final: la lectura se registra automáticamente al cubrir su contenido y el tiempo mínimo de atención.'}</p>
 {guide.sections.map((s,i)=><section hidden={active!==`chapter-${i}`} id={`chapter-${i}`} tabIndex={-1} data-lesson-section key={i} data-reading-section={i} data-reading-recorded={state.readingSections[String(week.id)]?.includes(i)??false} className="study-section"><div className="chapter-label">CAPÍTULO {String(i+1).padStart(2,'0')}</div><h2>{s.title}</h2><p>{s.body}</p>{s.concepts&&<ReadingConcepts concepts={s.concepts}/>}{s.points.length>0&&<ul className="bullet-list">{s.points.map((x,j)=><li key={j}>{x}</li>)}</ul>}</section>)}
 <section hidden={active!==`chapter-${guide.sections.length}`} id={`chapter-${guide.sections.length}`} tabIndex={-1} data-lesson-section data-reading-section={guide.sections.length} data-reading-recorded={state.readingSections[String(week.id)]?.includes(guide.sections.length)??false} className="study-section"><div className="chapter-label">PRÁCTICA GUIADA</div><h2>{guide.example.title}</h2><p>{guide.example.context}</p>{guide.example.concepts?<ReadingConcepts concepts={guide.example.concepts}/>:<ol className="number-list">{guide.example.steps.map((s,i)=><li key={i}>{s}</li>)}</ol>}{guide.example.code&&<pre className="code-block"><code>{guide.example.code}</code></pre>}</section>
 {guide.exercise&&<div hidden={active!=='practical-exercise'}><PracticalExercisePanel week={week.id} exercise={guide.exercise}/></div>}
 <section hidden={active!=='self-check'} id="self-check" tabIndex={-1} data-lesson-section className="study-section"><div className="chapter-label">AUTOEVALUACIÓN</div><h2>{guide.question.q}</h2><div className="options">{guide.question.options.map((s,i)=><button key={i} className={'option '+(selected===i?'chosen':'')} aria-pressed={selected===i} disabled={!ready} onClick={()=>{setSelected(i);void recordLearning({type:'lesson-answer',week:week.id,answer:i})}}>{s}</button>)}</div>{selected!==null&&<p className={selected===guide.question.correct?'feedback good':'feedback bad'}>{selected===guide.question.correct?'✓ ¡Bien! ':'Revisa la explicación: '}{guide.question.why}</p>}<SaveFeedback actionKey={`lesson:${week.id}`}/></section>
 <div hidden={active!=='study-notes'}><LearningDisclosure id="study-notes" title="Mis notas de estudio" description="Anota conclusiones, dudas e ideas sin salir de la clase"><label className="notes-label">Mis notas<textarea className="notes" disabled={!ready} aria-label="Mis notas" placeholder="Escribe aquí tus conclusiones, dudas y evidencias..." value={state.notes[String(week.id)]??''} onChange={e=>saveNote(week.id,e.target.value)} onBlur={flushNote}/></label><SaveFeedback actionKey={`note:${week.id}`}/><p className="hint">{remote?'Guardado automático en tu cuenta.':'Guardado en este navegador. Crea una cuenta para sincronizar tus notas.'}</p></LearningDisclosure></div>
 <div hidden={active!=='study-resources'}><LearningDisclosure id="study-resources" title="Recursos para profundizar" description="Documentación oficial y un error frecuente que conviene evitar"><div className="lesson-resources">{guide.links.map(([name,url],i)=><a className="resource-link" key={i} href={url} target="_blank" rel="noopener noreferrer">{name} ↗</a>)}</div><p className="hint">Error frecuente: {guide.pitfall}</p></LearningDisclosure></div>
 <LessonPagination pages={chapters} activeId={active} onChange={go} bottom/>
 <div className="lesson-completion"><p className="learning-status">{complete?'✓ Semana completada automáticamente':'Tu semana se completará al terminar las cuatro etapas del recorrido.'}</p><Link className="text-link" href={`/modules/${week.module}#module-quiz`}>Ir a evaluación del módulo ↗</Link></div>
 <div className="lesson-end">{week.id<24&&<Link href={`/study/${week.id+1}`} className="button button-outline">Siguiente semana ↗</Link>}</div>
 </div><aside className="study-aside"><nav className="aside-card lesson-outline" aria-label="Índice de la clase"><p className="eyebrow">EN ESTA CLASE</p>{chapters.map((chapter,i)=><a href={`#${chapter.id}`} key={chapter.id} className="outline-row" aria-current={active===chapter.id?'location':undefined} onClick={event=>{event.preventDefault();go(chapter.id)}}><span aria-hidden="true">{String(i+1).padStart(2,'0')}</span>{chapter.title}</a>)}</nav><div className="aside-card contextual-help"><p className="eyebrow">TU ALIADA DE ESTUDIO</p><p>¿Una duda sobre <strong>{activeTopic}</strong>?</p><AskLia topic={activeTopic} week={week.id}/><small>MariBug prepara la pregunta; tú decides cuándo enviarla.</small></div></aside></div>
 </div>;
}
