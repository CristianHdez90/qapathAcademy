/** Estado serializable versionado. Nunca incluye contraseñas ni identificadores personales. */
export type Progress = {
  version:2;weeks:number[];read:number[];tasks:string[];labs:string[];
  final:number[];quizzes:Record<string,number>;notes:Record<string,string>;
  scrumIntro:boolean;scrumQuizScore:number;hours:number;
};
export function emptyProgress():Progress{return {version:2,weeks:[],read:[],tasks:[],labs:[],final:[],quizzes:{},notes:{},scrumIntro:false,scrumQuizScore:0,hours:9};}
export function fromUnknown(value:unknown):Progress {
  const base=emptyProgress();
  if(!value||typeof value!=='object'||Array.isArray(value))return base;
  const v=value as Record<string,unknown>;
  const nums=(key:string)=>Array.isArray(v[key])?(v[key] as unknown[]).filter((n):n is number=>Number.isInteger(n)&&typeof n==='number'&&n>=0&&n<=100):[];
  const strings=(key:string)=>Array.isArray(v[key])?(v[key] as unknown[]).filter((x):x is string=>typeof x==='string'&&x.length<=160):[];
  const objNums=(key:string)=>{const obj=v[key];if(!obj||typeof obj!=='object'||Array.isArray(obj))return {};return Object.fromEntries(Object.entries(obj).filter(([k,val])=>k.length<80&&typeof val==='number'&&Number.isFinite(val)&&val>=0&&val<=100));};
  const objStrings=(key:string)=>{const obj=v[key];if(!obj||typeof obj!=='object'||Array.isArray(obj))return {};return Object.fromEntries(Object.entries(obj).filter(([k,val])=>k.length<80&&typeof val==='string'&&val.length<=8000));};
  return {...base,weeks:nums('weeks'),read:nums('read'),tasks:strings('tasks'),labs:strings('labs'),final:nums('final'),quizzes:objNums('quizzes'),notes:objStrings('notes'),scrumIntro:v.scrumIntro===true,scrumQuizScore:typeof v.scrumQuizScore==='number'?Math.min(100,Math.max(0,v.scrumQuizScore)):0,hours:typeof v.hours==='number'&&v.hours>=1&&v.hours<=60?v.hours:9};
}
export function toggleInArray<T>(values:T[],value:T):T[]{return values.includes(value)?values.filter(x=>x!==value):[...values,value];}
export function progressPercentage(progress:Progress,total=24){return total?Math.round(100*progress.weeks.length/total):0;}
