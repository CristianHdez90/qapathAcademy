import {fromUnknown,toggleInArray} from './progress';
import type {Progress} from './progress';
import {weekRequirements} from './automatic-completion';
import {learningRules} from './learning-rules';
export type ProgressCommand =
 |{type:'toggle';key:'weeks'|'read'|'tasks'|'labs'|'final';value:number|string}
 |{type:'note';week:number;text:string}
 |{type:'grade';moduleId:string;score:number}
 |{type:'scrum-grade';score:number}
 |{type:'scrum-intro'}
 |{type:'reading-section';week:number;section:number}
 |{type:'lesson-answer';week:number;answer:number}
 |{type:'submit-evidence';kind:'task'|'lab';id:string;text:string};
const validNumber=(value:unknown)=>typeof value==='number'&&Number.isInteger(value)&&value>=0&&value<=100;
export function applyProgressCommand(current:Progress,command:ProgressCommand):Progress {
 return fromUnknown(applyCommand(current,command));
}
function applyCommand(current:Progress,command:ProgressCommand):Progress {
 const state=fromUnknown(current);
 switch(command.type){
  case 'toggle': {
   if(command.key!=='final')throw new Error('Avance manual inválido: completa las actividades de aprendizaje.');
   if(!validNumber(command.value)||Number(command.value)>9)throw new Error('Entregable inválido');
   return {...state,final:toggleInArray(state.final,command.value as number)};
  }
  case 'reading-section': {
   const rule=weekRequirements(command.week);
   if(!rule||!Number.isInteger(command.section)||command.section<0||command.section>=rule.sections)throw new Error('Sección de lectura inválida');
   return {...state,readingSections:{...state.readingSections,[command.week]:[...new Set([...(state.readingSections[String(command.week)]||[]),command.section])]}};
  }
  case 'lesson-answer': {
   const rule=weekRequirements(command.week);
   if(!rule||!Number.isInteger(command.answer)||command.answer<0||command.answer>=rule.options)throw new Error('Respuesta inválida');
   return command.answer===rule.answer?{...state,lessonChecks:[...new Set([...state.lessonChecks,command.week])]}:state;
  }
  case 'submit-evidence': {
   const valid=command.kind==='task'?learningRules.some(r=>Array.from({length:r.tasks},(_,i)=>`${r.week}:${i}`).includes(command.id)):learningRules.some(r=>r.labs.some(id=>id===command.id));
   if(!valid||command.text.trim().length<40||command.text.length>8000)throw new Error('Evidencia inválida: escribe entre 40 y 8000 caracteres.');
   return {...state,evidence:{...state.evidence,[`${command.kind}:${command.id}`]:command.text.trim()}};
  }
  case 'note':if(!Number.isInteger(command.week)||command.week<1||command.week>24||command.text.length>8000)throw new Error('Nota inválida');return {...state,notes:{...state.notes,[String(command.week)]:command.text}};
  case 'grade':if(!/^[a-z0-9-]{1,80}$/.test(command.moduleId)||!Number.isFinite(command.score)||command.score<0||command.score>100)throw new Error('Calificación inválida');return {...state,quizzes:{...state.quizzes,[command.moduleId]:Math.max(state.quizzes[command.moduleId]??0,command.score)}};
  case 'scrum-grade':if(!Number.isFinite(command.score)||command.score<0||command.score>100)throw new Error('Calificación Scrum inválida');return {...state,scrumQuizScore:Math.max(state.scrumQuizScore,command.score)};
  case 'scrum-intro':return {...state,scrumIntro:!state.scrumIntro};
 }
}
export interface StudentProgressPort {
 get(userId:string):Promise<Progress>;
 apply(userId:string,command:ProgressCommand):Promise<Progress>;
 import(userId:string,previous:Progress):Promise<Progress>;
}
export function mergeProgress(current:Progress,previous:unknown):Progress{
 const p=fromUnknown(previous),a=fromUnknown(current);
 p.weeks=p.weeks.filter(v=>v>=1&&v<=24);p.read=p.read.filter(v=>v>=1&&v<=24);p.final=p.final.filter(v=>v>=0&&v<=9);const unique=<T>(x:T[],y:T[])=>[...new Set([...x,...y])];
 const scores={...a.quizzes};for(const [id,score] of Object.entries(p.quizzes))scores[id]=Math.max(scores[id]??0,score);
 const readingSections={...a.readingSections};for(const [key,value] of Object.entries(p.readingSections))readingSections[key]=unique(readingSections[key]||[],value);
 return fromUnknown({...a,readingSections,lessonChecks:unique(a.lessonChecks,p.lessonChecks),evidence:{...p.evidence,...a.evidence},final:unique(a.final,p.final),quizzes:scores,notes:{...p.notes,...a.notes},scrumIntro:a.scrumIntro||p.scrumIntro,scrumQuizScore:Math.max(a.scrumQuizScore,p.scrumQuizScore)});
}
