import {QUIZ_PASS_PERCENT,weekRequirements,practiceCompleted,isFoundationWeek,foundationChapters,foundationCardsRead,foundationChapterPassed,foundationCardOfCheck} from '@qapath/progress';
import type {Progress} from '@qapath/progress';

export type LearningStep={id:string;label:string;done:boolean;detail:string;href:string};
export function learningSteps(state:Progress,week:number):LearningStep[]{
 const rule=weekRequirements(week);if(!rule)return [];
 const base=`/study/${week}`,moduleHref=`/modules/${rule.module}`;
 if(isFoundationWeek(week))return foundationSteps(state,week,base);
 const read=state.readingSections[String(week)]?.length||0;
 const practice=practiceCompleted(state.evidence,week);
 return [
  {id:'reading',label:'Lectura',done:state.read.includes(week),detail:`${read}/${rule.sections} secciones`,href:`${base}#chapter-${Array.from({length:rule.sections},(_,i)=>i).find(i=>!state.readingSections[String(week)]?.includes(i))??0}`},
  {id:'practice',label:'Práctica',done:practice,detail:practice?'Actividad completada':'Completa la actividad de esta semana',href:`${base}#practical-exercise`},
  {id:'check',label:'Autoevaluación',done:state.lessonChecks.includes(week),detail:state.lessonChecks.includes(week)?'Respuesta correcta':'Comprueba lo aprendido',href:`${base}#self-check`},
  {id:'quiz',label:'Test de cierre',done:(state.quizzes[rule.module]??0)>=QUIZ_PASS_PERCENT,detail:`${state.quizzes[rule.module]??0}% · mínimo ${QUIZ_PASS_PERCENT}%`,href:closingTestHref(rule.module)??`${moduleHref}`},
 ];
}
/** D-10: el test del módulo vive al final de la última semana del módulo («Test de cierre»). */
export function closingTestHref(moduleId:string){
 const last=Array.from({length:24},(_,i)=>24-i).find(w=>weekRequirements(w)?.module===moduleId);
 return last?`/study/${last}#closing-test`:undefined;
}
export function nextLearningAction(state:Progress,weeks:readonly number[]){
 for(const week of weeks){
  const step=learningSteps(state,week).find(s=>!s.done);
  if(step)return {week,...step};
 }
 return null;
}
/** Fundamentos v2 (D-05): tarjetas leídas, minitests aprobados por capítulo y práctica. Sin autoevaluación ni test del módulo. */
function foundationSteps(state:Progress,week:number,base:string):LearningStep[]{
 const chapters=foundationChapters(week),cards=foundationCardsRead(state,week),passed=chapters.filter(rule=>foundationChapterPassed(state,rule)).length;
 const anchor=(id:string)=>id.replace(/^FND-C/,`FND-W0${week}-C`);
 const unread=chapters.flatMap(rule=>rule.cards).find(card=>!state.foundationCards?.[card]);
 const pendingChapter=chapters.find(rule=>!rule.cards.length);
 const pendingCheck=chapters.flatMap(rule=>rule.checks).find(id=>!state.foundationChecks?.[id]);
 const practice=practiceCompleted(state.evidence,week),complete=state.weeks.includes(week);
 return [
  {id:'reading',label:'Lectura',done:state.read.includes(week),detail:`${cards.read}/${cards.total} tarjetas leídas`,href:`${base}#${unread??(pendingChapter?anchor(pendingChapter.id):anchor(chapters[0].id))}`},
  {id:'checks',label:'Minitests',done:complete||passed===chapters.length,detail:`${passed}/${chapters.length} capítulos aprobados`,href:`${base}#${(pendingCheck&&foundationCardOfCheck(pendingCheck))||(pendingChapter?anchor(pendingChapter.id):anchor(chapters[0].id))}`},
  {id:'practice',label:'Práctica',done:practice,detail:practice?'Actividad completada':'Completa la actividad de esta semana',href:`${base}#practical-exercise`},
 ];
}
export function learningModuleStatus(state:Progress,weeks:readonly number[]){
 if(weeks.every(w=>state.weeks.includes(w)))return 'Completado';
 const started=weeks.some(w=>{
  const rule=weekRequirements(w);
  return (state.readingSections[String(w)]?.length||0)>0||foundationChapters(w).some(rule=>rule.cards.some(card=>state.foundationCards?.[card]))||state.lessonChecks.includes(w)||!!state.evidence[`exercise:${w}`]||
   !!rule&&Object.hasOwn(state.quizzes,rule.module);
 });
 return started?'En curso':'Sin iniciar';
}
