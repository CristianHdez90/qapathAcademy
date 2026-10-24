import {emptyProgress,fromUnknown,toggleInArray} from './progress';
import type {Progress} from './progress';
export type ProgressCommand =
 |{type:'toggle';key:'weeks'|'read'|'tasks'|'labs'|'final';value:number|string}
 |{type:'note';week:number;text:string}
 |{type:'grade';moduleId:string;score:number}
 |{type:'scrum-grade';score:number}
 |{type:'scrum-intro'};
const numericKeys=new Set(['weeks','read','final']);
const validNumber=(value:unknown)=>typeof value==='number'&&Number.isInteger(value)&&value>=0&&value<=100;
export function applyProgressCommand(current:Progress,command:ProgressCommand):Progress {
 const state=fromUnknown(current);
 switch(command.type){
  case 'toggle': {
   if(!(numericKeys.has(command.key)?validNumber(command.value):typeof command.value==='string'&&command.value.length>0&&command.value.length<=160))throw new Error('Elemento de progreso inválido');
   if(command.key==='weeks'&&(!validNumber(command.value)||Number(command.value)<1||Number(command.value)>24))throw new Error('Semana inválida');
   if(command.key==='read'&&(!validNumber(command.value)||Number(command.value)<1||Number(command.value)>24))throw new Error('Lectura inválida');
   if(command.key==='final'&&(!validNumber(command.value)||Number(command.value)>9))throw new Error('Entregable inválido');
   if(command.key==='weeks'||command.key==='read'||command.key==='final')return {...state,[command.key]:toggleInArray(state[command.key],command.value as number)};
   return {...state,[command.key]:toggleInArray(state[command.key],command.value as string)};
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
 return {...emptyProgress(),...a,weeks:unique(a.weeks,p.weeks),read:unique(a.read,p.read),tasks:unique(a.tasks,p.tasks),labs:unique(a.labs,p.labs),final:unique(a.final,p.final),quizzes:scores,notes:{...p.notes,...a.notes},scrumIntro:a.scrumIntro||p.scrumIntro,scrumQuizScore:Math.max(a.scrumQuizScore,p.scrumQuizScore)};
}
