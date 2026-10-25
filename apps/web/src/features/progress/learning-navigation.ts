import {QUIZ_PASS_PERCENT,weekRequirements,practiceCompleted} from '@qapath/progress';
import type {Progress} from '@qapath/progress';

export type LearningStep={id:string;label:string;done:boolean;detail:string;href:string};
export function learningSteps(state:Progress,week:number):LearningStep[]{
 const rule=weekRequirements(week);if(!rule)return [];
 const base=`/study/${week}`,moduleHref=`/modules/${rule.module}`;
 const read=state.readingSections[String(week)]?.length||0;
 const practice=practiceCompleted(state.evidence,week);
 return [
  {id:'reading',label:'Lectura',done:state.read.includes(week),detail:`${read}/${rule.sections} secciones`,href:`${base}#chapter-${Array.from({length:rule.sections},(_,i)=>i).find(i=>!state.readingSections[String(week)]?.includes(i))??0}`},
  {id:'practice',label:'Práctica',done:practice,detail:practice?'Actividad completada':'Completa la actividad de esta semana',href:`${base}#practical-exercise`},
  {id:'check',label:'Autoevaluación',done:state.lessonChecks.includes(week),detail:state.lessonChecks.includes(week)?'Respuesta correcta':'Comprueba lo aprendido',href:`${base}#self-check`},
  {id:'quiz',label:'Test del módulo',done:(state.quizzes[rule.module]??0)>=QUIZ_PASS_PERCENT,detail:`${state.quizzes[rule.module]??0}% · mínimo ${QUIZ_PASS_PERCENT}%`,href:`${moduleHref}#module-quiz`},
 ];
}
export function nextLearningAction(state:Progress,weeks:readonly number[]){
 for(const week of weeks){
  const step=learningSteps(state,week).find(s=>!s.done);
  if(step)return {week,...step};
 }
 return null;
}
export function learningModuleStatus(state:Progress,weeks:readonly number[]){
 if(weeks.every(w=>state.weeks.includes(w)))return 'Completado';
 const started=weeks.some(w=>{
  const rule=weekRequirements(w);
  return (state.readingSections[String(w)]?.length||0)>0||state.lessonChecks.includes(w)||!!state.evidence[`exercise:${w}`]||
   !!rule&&Object.hasOwn(state.quizzes,rule.module);
 });
 return started?'En curso':'Sin iniciar';
}
