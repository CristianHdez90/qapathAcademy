'use client';
import Link from 'next/link';
import {learningSteps} from '@/features/progress/learning-navigation';
import {useProgress} from '@/features/progress/progress-provider';

export function LearningSteps({week,focused=false}:{week:number;focused?:boolean}){
 const {state,ready}=useProgress();const steps=learningSteps(state,week),active=steps.find(s=>!s.done);
 return <nav className="learning-stages" aria-label="Etapas de la semana" aria-busy={!ready}><div className="learning-stages-heading"><b>Tu recorrido</b><span>{ready?`${steps.filter(s=>s.done).length} de ${steps.length} etapas completadas`:'Cargando avance…'}</span></div><ol>{steps.map((step,i)=>{
  const Target=step.href.startsWith(`/study/${week}#`)?'a':Link;
  const href=focused&&step.href.startsWith(`/study/${week}#`)?step.href.replace('#','?view=focused#'):step.href;
  return <li key={step.id} className={step.done?'is-done':step===active?'is-current':''}><Target href={href} aria-current={step===active?'step':undefined} onClick={()=>{
   const target=document.getElementById(step.href.split('#')[1]);if(target instanceof HTMLDetailsElement)target.open=true;
  }}><span className="stage-number" aria-hidden="true">{step.done?'✓':i+1}</span><span><strong>{step.label}</strong><small>{ready?step.detail:'Cargando…'}</small><span className="stage-state">{ready?(step.done?'Completado':step===active?'Siguiente paso':'Pendiente'):'Por consultar'}</span></span></Target></li>;
 })}</ol></nav>;
}
