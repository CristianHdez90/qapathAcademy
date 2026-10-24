"use client";
import Link from 'next/link';
import {useProgress} from '@/features/progress/progress-provider';
import {Quiz} from './quiz';
import {LearningEvidence} from './learning-evidence';
import type {Module,Week,Lab,Resource,PublicQuestion} from '@qapath/contracts';
export function ModuleDetail({module,weeks,labs,resources,quiz}:{module:Module;weeks:Week[];labs:Lab[];resources:Resource[];quiz:PublicQuestion[]}){
 const {state}=useProgress();const done=weeks.filter(w=>state.weeks.includes(w.id)).length;
 return <><div className="page-heading"><div><p className="eyebrow">MÓDULO {module.number} · {module.track}</p><h1>{module.title}</h1><p className="page-description">{module.summary}</p></div><span className="pill">{module.range}</span></div>
 <div className="module-summary"><div><small>OBJETIVO DEL MÓDULO</small><p>{module.outcome}</p></div><div><small>AVANCE</small><strong>{done}/{weeks.length}</strong><div className="progress-line"><i style={{width:`${Math.round(done/weeks.length*100)}%`}}/></div></div></div>
 <div className="section-head compact"><div><p className="eyebrow">CONTENIDO DE ESTUDIO</p><h2>Clases y actividades</h2></div></div>
 <div className="lesson-list">{weeks.map(w=><div className="lesson-row" key={w.id}><span className="learning-week-state" aria-label={`Semana ${w.id}: ${state.weeks.includes(w.id)?'completada':'pendiente'}`}>{state.weeks.includes(w.id)?'✓':'○'}</span><Link href={`/study/${w.id}`} className="lesson-info"><span>SEMANA {String(w.id).padStart(2,'0')}</span><h3>{w.title} <span>↗</span></h3><p>{w.goal}</p><div className="chip-row">{w.topics.slice(0,2).map(t=><span className="skill-chip" key={t}>{t}</span>)}</div></Link><span className="lesson-arrow">↗</span></div>)}</div>
 <div className="section-head compact"><div><p className="eyebrow">APLICA LO APRENDIDO</p><h2>Laboratorios</h2></div></div><div className="lab-grid">{labs.map(l=><article className="lab-card" key={l.id}><div className="lab-header"><span className="pill">{l.level}</span><span>{l.time}</span></div><h3>{l.title}</h3><p>{l.desc}</p><ul className="bullet-list">{l.criteria.map(criterion=><li key={criterion}>{criterion}</li>)}</ul><LearningEvidence kind="lab" id={l.id} title={l.title}/></article>)}</div>
 <Quiz moduleId={module.id} questions={quiz}/>
 {resources.length>0&&<section className="resource-strip"><p className="eyebrow">DOCUMENTACIÓN OFICIAL</p>{resources.map(r=><a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer">{r.title} ↗</a>)}</section>}
 </>;
}
