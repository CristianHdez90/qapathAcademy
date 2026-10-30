"use client";
import Link from 'next/link';
import {practiceCompleted,foundationRules,foundationChapterPassed} from '@qapath/progress';
import {useProgress} from '@/features/progress/progress-provider';
import './practical-exercise.css';
import './module-detail.css';
import {nextLearningAction} from '@/features/progress/learning-navigation';
import type {ReactNode} from 'react';
import type {Module,Week,Resource,PublicQuestion} from '@qapath/contracts';
import tree from '@/features/navigation/learning-tree.json';

/**
 * Vista del módulo (RQ-02 a RQ-04): sin tarjeta de objetivo/avance, sin estado ni MariBug y sin evaluación del módulo.
 * Fundamentos muestra sus 8 capítulos; el resto de módulos evalúa con el «Test de cierre» de su última semana (D-10).
 */
/** `extraRows`: filas adicionales del mismo índice (p. ej. «Lecturas complementarias» de la biblioteca). */
export function ModuleDetail({module,weeks,resources,actions,extraRows}:{module:Module;weeks:Week[];labs?:unknown[];resources:Resource[];quiz?:PublicQuestion[];actions?:ReactNode;extraRows?:ReactNode}){
 const {state,ready}=useProgress();
 const next=nextLearningAction(state,module.weeks);
 const branch=tree.find(item=>item.id===module.id);
 return <><div className="page-heading"><div><p className="eyebrow">CURSO · {module.track}</p><h1>{module.title}</h1><p className="page-description">{module.summary}</p></div><span className="pill">{module.weeks.length} {module.weeks.length===1?'semana':'semanas'}</span></div>
 {actions}
 <div className="section-head compact"><div><p className="eyebrow">CONTENIDO DE ESTUDIO</p><h2>Clases y actividades</h2></div>{ready&&next&&<Link className="button button-primary" href={next.href}>Continuar: {next.label} ↗</Link>}</div>
 <div className="lesson-list">{weeks.map(w=>{
  const chapters=branch?.weeks.find(item=>item.id===w.id)?.foundation;
  return <div className="lesson-row" key={w.id}><span className="learning-week-state" aria-label={`Semana ${w.id}: ${state.weeks.includes(w.id)?'completada':'pendiente'}`}>{state.weeks.includes(w.id)?'✓':'○'}</span><div className="lesson-info"><Link href={`/study/${w.id}`} className="lesson-link"><span>SEMANA {String(w.id).padStart(2,'0')}</span><h3>{w.title} <span>↗</span></h3></Link><p>{w.goal}</p>
   {chapters?<ol className="module-chapters">{chapters.map(chapter=>{const rule=foundationRules.find(item=>item.id===chapter.id),read=chapter.cards.filter(card=>state.foundationCards?.[card.id]).length,passed=!!rule&&foundationChapterPassed(state,rule);
    return <li key={chapter.id}><Link href={`/study/${w.id}#${chapter.anchor}`}>Capítulo {String(chapter.number).padStart(2,'0')} · {chapter.title}</Link><small>{ready?(passed?'✓ Aprobado':`${read}/${chapter.cards.length} tarjetas leídas`):'Cargando…'}</small></li>;})}</ol>
   :<div className="chip-row">{w.topics.slice(0,2).map(t=><span className="skill-chip" key={t}>{t}</span>)}</div>}
  </div><span className="lesson-arrow" aria-hidden="true">↗</span></div>;
 })}{extraRows}</div>
 {module.id!=='fundamentos'&&weeks.length>0&&<p className="module-closing-test"><Link className="text-link" href={`/study/${weeks[weeks.length-1].id}#closing-test`}>Test de cierre del curso ↗</Link> <span>· al final de la semana {weeks[weeks.length-1].id}</span></p>}
 <section className="practice-banner" aria-label="Ejercicios prácticos del curso"><h2>Practica con herramientas reales</h2><p>Actividades por semana con ejecución, resultados y evidencia.</p><p>Prácticas completadas: {weeks.filter(w=>practiceCompleted(state.evidence,w.id)).length} / {weeks.length}</p><div className="practical-actions">{weeks.map(w=><Link key={w.id} className="button button-outline" href={`/practice/${w.id}`}>{state.evidence[`exercise:${w.id}`]?'✓ Práctica registrada':'Ejercicio'} · Semana {w.id} ↗</Link>)}</div></section>
 {resources.length>0&&<section className="resource-strip"><p className="eyebrow">DOCUMENTACIÓN OFICIAL</p>{resources.map(r=><a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer">{r.title} ↗</a>)}</section>}
 </>;
}
