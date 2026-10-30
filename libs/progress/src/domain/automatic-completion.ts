import type {Progress} from './progress';
import {learningRules} from './learning-rules';
import {practiceCompleted} from './practice-completion';
import {isFoundationWeek,foundationWeekRead,foundationWeekPassed} from './foundation-rules';
export const QUIZ_PASS_PERCENT=70;
export const READING_SECTION_SECONDS=3;
export function weekRequirements(week:number){return learningRules.find(r=>r.week===week);}
/** Fundamentos (semanas 1–2): se mantiene la regla histórica para no revertir logros (D-03) y se añade la regla v2 (D-05). */
export function automaticCompletion(state:Progress):Progress{
 const historicalRead=(r:typeof learningRules[number])=>Array.from({length:r.sections},(_,i)=>i).every(i=>state.readingSections[String(r.week)]?.includes(i));
 const read=learningRules.filter(r=>historicalRead(r)||isFoundationWeek(r.week)&&foundationWeekRead(state,r.week)).map(r=>r.week);
 const tasks=learningRules.flatMap(r=>Array.from({length:r.tasks},(_,i)=>`${r.week}:${i}`)).filter(id=>!!state.evidence[`task:${id}`]);
 const labs=[...new Set(learningRules.flatMap(r=>[...r.labs]))].filter(id=>!!state.evidence[`lab:${id}`]);
 const historical=(r:typeof learningRules[number])=>historicalRead(r)&&state.lessonChecks.includes(r.week)&&practiceCompleted(state.evidence,r.week)&&(state.quizzes[r.module]??0)>=QUIZ_PASS_PERCENT;
 const foundation=(r:typeof learningRules[number])=>isFoundationWeek(r.week)&&foundationWeekRead(state,r.week)&&foundationWeekPassed(state,r.week)&&practiceCompleted(state.evidence,r.week);
 const weeks=learningRules.filter(r=>historical(r)||foundation(r)).map(r=>r.week);
 return {...state,read,tasks,labs,weeks};
}
