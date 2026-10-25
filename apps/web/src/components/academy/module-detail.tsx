"use client";
import Link from 'next/link';
import {practiceCompleted,progressPercentage} from '@qapath/progress';
import {useProgress} from '@/features/progress/progress-provider';
import {Quiz} from './quiz';

import './practical-exercise.css';
import {AskLia} from '@/components/assistant/ask-lia';
import {learningModuleStatus,nextLearningAction} from '@/features/progress/learning-navigation';
import type {Module,Week,Resource,PublicQuestion} from '@qapath/contracts';
export function ModuleDetail({module,weeks,resources,quiz}:{module:Module;weeks:Week[];labs?:unknown[];resources:Resource[];quiz:PublicQuestion[]}){
 const {state}=useProgress();const done=weeks.filter(w=>state.weeks.includes(w.id)).length;
 const next=nextLearningAction(state,module.weeks);const pct=progressPercentage(state,module.weeks);
 return <><div className="page-heading"><div><p className="eyebrow">MÓDULO {module.number} · {module.track}</p><h1>{module.title}</h1><p className="page-description">{module.summary}</p></div><span className="pill">{module.range}</span></div>
 <div className="module-summary"><div><small>OBJETIVO DEL MÓDULO</small><p>{module.outcome}</p></div><div><small>AVANCE</small><strong>{pct}%</strong><small>{done}/{weeks.length} semanas completadas</small><div className="progress-line"><i style={{width:`${pct}%`}}/></div></div></div>
 <div className="module-guidance"><span className="module-state">{learningModuleStatus(state,module.weeks)}</span>{next&&<Link className="button button-primary" href={next.href}>Continuar: {next.label} ↗</Link>}<AskLia topic={module.title}/></div>
 <div className="section-head compact"><div><p className="eyebrow">CONTENIDO DE ESTUDIO</p><h2>Clases y actividades</h2></div></div>
 <div className="lesson-list">{weeks.map(w=><div className="lesson-row" key={w.id}><span className="learning-week-state" aria-label={`Semana ${w.id}: ${state.weeks.includes(w.id)?'completada':'pendiente'}`}>{state.weeks.includes(w.id)?'✓':'○'}</span><Link href={`/study/${w.id}`} className="lesson-info"><span>SEMANA {String(w.id).padStart(2,'0')}</span><h3>{w.title} <span>↗</span></h3><p>{w.goal}</p><div className="chip-row">{w.topics.slice(0,2).map(t=><span className="skill-chip" key={t}>{t}</span>)}</div></Link><span className="lesson-arrow">↗</span></div>)}</div>
 <section className="practice-banner" aria-label="Ejercicios prácticos del módulo"><h2>Practica con herramientas reales</h2><p>Actividades por semana con ejecución, resultados y evidencia.</p><p>Prácticas completadas: {weeks.filter(w=>practiceCompleted(state.evidence,w.id)).length} / {weeks.length}</p><div className="practical-actions">{weeks.map(w=><Link key={w.id} className="button button-outline" href={`/practice/${w.id}`}>{state.evidence[`exercise:${w.id}`]?'✓ Práctica registrada':'Ejercicio'} · Semana {w.id} ↗</Link>)}</div></section>
 <div id="module-quiz" tabIndex={-1}><Quiz moduleId={module.id} questions={quiz}/></div>
 {resources.length>0&&<section className="resource-strip"><p className="eyebrow">DOCUMENTACIÓN OFICIAL</p>{resources.map(r=><a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer">{r.title} ↗</a>)}</section>}
 </>;
}
