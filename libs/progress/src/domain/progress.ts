import {automaticCompletion,QUIZ_PASS_PERCENT} from './automatic-completion';
import {learningRules} from './learning-rules';
import {practiceCompleted} from './practice-completion';
/** Estado serializable versionado. Nunca incluye contraseñas ni identificadores personales. */
export type Progress = {
  version:2;weeks:number[];read:number[];tasks:string[];labs:string[];
  final:number[];quizzes:Record<string,number>;notes:Record<string,string>;
  scrumIntro:boolean;scrumQuizScore:number;hours:number;
  readingSections:Record<string,number[]>;lessonChecks:number[];evidence:Record<string,string>;
};
export function emptyProgress():Progress{return {version:2,weeks:[],read:[],tasks:[],labs:[],final:[],quizzes:{},notes:{},scrumIntro:false,scrumQuizScore:0,hours:9,readingSections:{},lessonChecks:[],evidence:{}};}
export function fromUnknown(value:unknown):Progress {
  const base=emptyProgress();
  if(!value||typeof value!=='object'||Array.isArray(value))return base;
  const v=value as Record<string,unknown>;
  const nums=(key:string)=>Array.isArray(v[key])?(v[key] as unknown[]).filter((n):n is number=>Number.isInteger(n)&&typeof n==='number'&&n>=0&&n<=100):[];
  const objNums=(key:string)=>{const obj=v[key];if(!obj||typeof obj!=='object'||Array.isArray(obj))return {};return Object.fromEntries(Object.entries(obj).filter(([k,val])=>k.length<80&&typeof val==='number'&&Number.isFinite(val)&&val>=0&&val<=100));};
  const objStrings=(key:string)=>{const obj=v[key];if(!obj||typeof obj!=='object'||Array.isArray(obj))return {};return Object.fromEntries(Object.entries(obj).filter(([k,val])=>k.length<80&&typeof val==='string'&&val.length<=(key==='evidence'&&['exercise:1','exercise:5','exercise:7','exercise:8','exercise:9'].includes(k)?32000:8000)));};
  const readingSections:Record<string,number[]>={};
  if(v.readingSections&&typeof v.readingSections==='object')for(const [key,sections] of Object.entries(v.readingSections)){
   if(/^([1-9]|1[0-9]|2[0-4])$/.test(key)&&Array.isArray(sections))readingSections[key]=[...new Set(sections.filter((n):n is number=>Number.isInteger(n)&&n>=0&&n<20))];
  }
  const evidence=Object.fromEntries(Object.entries(objStrings('evidence')).filter(([,text])=>typeof text==='string'&&text.trim().length>=40));
  return automaticCompletion({...base,final:nums('final'),quizzes:objNums('quizzes'),notes:objStrings('notes'),readingSections,lessonChecks:nums('lessonChecks'),evidence,scrumIntro:v.scrumIntro===true,scrumQuizScore:typeof v.scrumQuizScore==='number'?Math.min(100,Math.max(0,v.scrumQuizScore)):0,hours:typeof v.hours==='number'&&v.hours>=1&&v.hours<=60?v.hours:9});
}
export function toggleInArray<T>(values:T[],value:T):T[]{return values.includes(value)?values.filter(x=>x!==value):[...values,value];}
/** Four equally weighted stages: reading, validated practice, self-check and module quiz. */
export function progressPercentage(progress:Progress,scope:number|readonly number[]=24):number{
 const requested=typeof scope==='number'?learningRules.slice(0,Math.max(0,scope)).map(r=>r.week):scope;
 const rules=learningRules.filter(r=>requested.includes(r.week));
 if(!rules.length)return 0;
 const fractions=rules.map(rule=>{
  const sections=new Set(progress.readingSections[String(rule.week)]||[]);
  const reading=Array.from({length:rule.sections},(_,i)=>i).filter(i=>sections.has(i)).length/rule.sections;
  const practice=practiceCompleted(progress.evidence,rule.week)?1:0;
  const check=progress.lessonChecks.includes(rule.week)?1:0;
  const quiz=(progress.quizzes[rule.module]??0)>=QUIZ_PASS_PERCENT?1:0;
  return (reading+practice+check+quiz)/4;
 });
 const value=100*fractions.reduce((sum,fraction)=>sum+fraction,0)/rules.length;
 // Reserve 100% for all requirements; retain small advances in the full 24-week route.
 return fractions.every(value=>value===1)?100:Math.min(99.9,Math.round(value*10)/10);
}
