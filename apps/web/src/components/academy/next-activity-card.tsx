'use client';
import Link from 'next/link';
import type {Week} from '@qapath/contracts';
import {useAuth} from '@/features/auth/auth-provider';
import {useProgress} from '@/features/progress/progress-provider';
import {learningSteps,nextLearningAction} from '@/features/progress/learning-navigation';

export function NextActivityCard({weeks}:{weeks:Week[]}){
 const {state,ready}=useProgress();const {user}=useAuth();
 if(user&&user.role!=='STUDENT')return null;
 const next=nextLearningAction(state,weeks.map(w=>w.id));const week=weeks.find(w=>w.id===next?.week);
 const total=next?learningSteps(state,next.week).length:0,completed=next?learningSteps(state,next.week).filter(s=>s.done).length:0;
 return <section className="next-activity" aria-labelledby="next-activity-title" aria-busy={!ready}>
  <div className="next-activity-copy"><p className="eyebrow">TU SIGUIENTE ACTIVIDAD</p><h2 id="next-activity-title">{!ready?'Preparando tu recorrido…':next?week?.title:'Completaste tu ruta de aprendizaje'}</h2><p>{ready?(next?`Semana ${next.week} · ${next.label}. ${next.detail}.`:'Tus lecturas, prácticas y evaluaciones están completas. Revisa tus evidencias y prepara tu portafolio.'):'Consultando tus lecturas, prácticas y evaluaciones.'}</p>
   {ready&&next&&<div className="next-stage-preview" aria-label={`${completed} de ${total} etapas completadas`}>{learningSteps(state,next.week).map(step=><span key={step.id} className={step.done?'done':step.id===next.id?'current':''} title={step.label}/>) }<small>{completed}/{total} etapas de esta semana</small></div>}
  </div>{ready&&<Link className="button button-primary" href={next?.href||'/resources'}>{next?`Continuar: ${next.label}`:'Revisar mis evidencias'} <span aria-hidden="true">↗</span></Link>}
 </section>;
}
