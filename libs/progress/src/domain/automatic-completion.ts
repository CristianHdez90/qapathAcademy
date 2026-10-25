import type {Progress} from './progress';
import {learningRules} from './learning-rules';
import {practiceCompleted} from './practice-completion';
export const QUIZ_PASS_PERCENT=70;
export const READING_SECTION_SECONDS=3;
export function weekRequirements(week:number){return learningRules.find(r=>r.week===week);}
export function automaticCompletion(state:Progress):Progress{
 const read=learningRules.filter(r=>Array.from({length:r.sections},(_,i)=>i).every(i=>state.readingSections[String(r.week)]?.includes(i))).map(r=>r.week);
 const tasks=learningRules.flatMap(r=>Array.from({length:r.tasks},(_,i)=>`${r.week}:${i}`)).filter(id=>!!state.evidence[`task:${id}`]);
 const labs=[...new Set(learningRules.flatMap(r=>[...r.labs]))].filter(id=>!!state.evidence[`lab:${id}`]);
 const weeks=learningRules.filter(r=>read.includes(r.week)&&state.lessonChecks.includes(r.week)&&
  practiceCompleted(state.evidence,r.week)&&(state.quizzes[r.module]??0)>=QUIZ_PASS_PERCENT).map(r=>r.week);
 return {...state,read,tasks,labs,weeks};
}
