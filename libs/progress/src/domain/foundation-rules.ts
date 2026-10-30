/**
 * Reglas académicas de Fundamentos v2 (SPEC-CONTENT-220, decisión D-05).
 * Generadas desde libs/content/src/data/fundamentals-v2.json y verificadas en tests/foundation-v2.test.mjs.
 * Un capítulo sin tarjetas publicadas no puede aprobarse.
 */
export const FOUNDATION_VERSION='fnd-v2';
export const FOUNDATION_CARD_SECONDS=8;
export const FOUNDATION_PASS_RATIO=0.7;
export type FoundationChapterRule={readonly id:string;readonly week:1|2;readonly cards:readonly string[];readonly checks:readonly string[]};
export const foundationRules:readonly FoundationChapterRule[]=[
 {id:'FND-C01',week:1,cards:['FND-W01-C01-T01','FND-W01-C01-T02','FND-W01-C01-T03','FND-W01-C01-T04','FND-W01-C01-T05','FND-W01-C01-T06','FND-W01-C01-T07','FND-W01-C01-T08'],checks:['FND-W01-C01-T01-Q1','FND-W01-C01-T01-Q2','FND-W01-C01-T02-Q1','FND-W01-C01-T03-Q1','FND-W01-C01-T04-Q1','FND-W01-C01-T05-Q1','FND-W01-C01-T06-Q1','FND-W01-C01-T07-Q1','FND-W01-C01-T08-Q1']},
 {id:'FND-C02',week:1,cards:['FND-W01-C02-T01','FND-W01-C02-T02','FND-W01-C02-T03','FND-W01-C02-T04','FND-W01-C02-T05','FND-W01-C02-T06','FND-W01-C02-T07','FND-W01-C02-T08','FND-W01-C02-T09'],checks:['FND-W01-C02-T01-Q1','FND-W01-C02-T02-Q1','FND-W01-C02-T03-Q1','FND-W01-C02-T04-Q1','FND-W01-C02-T05-Q1','FND-W01-C02-T06-Q1','FND-W01-C02-T07-Q1','FND-W01-C02-T08-Q1','FND-W01-C02-T09-Q1']},
 {id:'FND-C03',week:1,cards:['FND-W01-C03-T01','FND-W01-C03-T02','FND-W01-C03-T03','FND-W01-C03-T04','FND-W01-C03-T05','FND-W01-C03-T06','FND-W01-C03-T07','FND-W01-C03-T08'],checks:['FND-W01-C03-T01-Q1','FND-W01-C03-T02-Q1','FND-W01-C03-T03-Q1','FND-W01-C03-T04-Q1','FND-W01-C03-T05-Q1','FND-W01-C03-T06-Q1','FND-W01-C03-T07-Q1','FND-W01-C03-T08-Q1']},
 {id:'FND-C04',week:1,cards:['FND-W01-C04-T01','FND-W01-C04-T02','FND-W01-C04-T03','FND-W01-C04-T04','FND-W01-C04-T05','FND-W01-C04-T06','FND-W01-C04-T07','FND-W01-C04-T08'],checks:['FND-W01-C04-T01-Q1','FND-W01-C04-T02-Q1','FND-W01-C04-T03-Q1','FND-W01-C04-T04-Q1','FND-W01-C04-T05-Q1','FND-W01-C04-T06-Q1','FND-W01-C04-T07-Q1','FND-W01-C04-T08-Q1']},
 {id:'FND-C05',week:2,cards:['FND-W02-C05-T01','FND-W02-C05-T02','FND-W02-C05-T03','FND-W02-C05-T04','FND-W02-C05-T05','FND-W02-C05-T06','FND-W02-C05-T07','FND-W02-C05-T08'],checks:['FND-W02-C05-T01-Q1','FND-W02-C05-T02-Q1','FND-W02-C05-T03-Q1','FND-W02-C05-T04-Q1','FND-W02-C05-T05-Q1','FND-W02-C05-T06-Q1','FND-W02-C05-T07-Q1','FND-W02-C05-T08-Q1']},
 {id:'FND-C06',week:2,cards:['FND-W02-C06-T01','FND-W02-C06-T02','FND-W02-C06-T03','FND-W02-C06-T04','FND-W02-C06-T05','FND-W02-C06-T06','FND-W02-C06-T07','FND-W02-C06-T08','FND-W02-C06-T09','FND-W02-C06-T10'],checks:['FND-W02-C06-T01-Q1','FND-W02-C06-T02-Q1','FND-W02-C06-T03-Q1','FND-W02-C06-T04-Q1','FND-W02-C06-T05-Q1','FND-W02-C06-T06-Q1','FND-W02-C06-T07-Q1','FND-W02-C06-T08-Q1','FND-W02-C06-T09-Q1','FND-W02-C06-T10-Q1']},
 {id:'FND-C07',week:2,cards:['FND-W02-C07-T01','FND-W02-C07-T02','FND-W02-C07-T03','FND-W02-C07-T04','FND-W02-C07-T05','FND-W02-C07-T06','FND-W02-C07-T07','FND-W02-C07-T08'],checks:['FND-W02-C07-T01-Q1','FND-W02-C07-T02-Q1','FND-W02-C07-T03-Q1','FND-W02-C07-T04-Q1','FND-W02-C07-T05-Q1','FND-W02-C07-T06-Q1','FND-W02-C07-T07-Q1','FND-W02-C07-T08-Q1']},
 {id:'FND-C08',week:2,cards:['FND-W02-C08-T01','FND-W02-C08-T02','FND-W02-C08-T03','FND-W02-C08-T04','FND-W02-C08-T05','FND-W02-C08-T06','FND-W02-C08-T07','FND-W02-C08-T08','FND-W02-C08-T09'],checks:['FND-W02-C08-T01-Q1','FND-W02-C08-T02-Q1','FND-W02-C08-T03-Q1','FND-W02-C08-T04-Q1','FND-W02-C08-T05-Q1','FND-W02-C08-T06-Q1','FND-W02-C08-T07-Q1','FND-W02-C08-T08-Q1','FND-W02-C08-T09-Q1']},
];
export type FoundationState={foundationCards?:Record<string,true>;foundationChecks?:Record<string,true>};
export const isFoundationWeek=(week:number)=>week===1||week===2;
export const foundationChapters=(week:number)=>foundationRules.filter(rule=>rule.week===week);
export const foundationCardExists=(cardId:string)=>foundationRules.some(rule=>rule.cards.includes(cardId));
/** Una pregunta pertenece a la tarjeta cuyo ID es su prefijo (FND-W01-C01-T01-Q2 → FND-W01-C01-T01). */
export function foundationCardOfCheck(questionId:string){
 const rule=foundationRules.find(item=>item.checks.includes(questionId));
 return rule?rule.cards.find(card=>questionId.startsWith(`${card}-Q`)):undefined;
}
export function foundationChapterPassed(state:FoundationState,rule:FoundationChapterRule){
 if(!rule.cards.length||!rule.checks.length)return false;
 const correct=rule.checks.filter(id=>state.foundationChecks?.[id]).length;
 return correct>=Math.ceil(rule.checks.length*FOUNDATION_PASS_RATIO);
}
export function foundationCardsRead(state:FoundationState,week:number){
 const cards=foundationChapters(week).flatMap(rule=>rule.cards);
 return {read:cards.filter(card=>state.foundationCards?.[card]).length,total:cards.length};
}
export function foundationWeekRead(state:FoundationState,week:number){
 const chapters=foundationChapters(week);
 return chapters.length>0&&chapters.every(rule=>rule.cards.length>0&&rule.cards.every(card=>state.foundationCards?.[card]));
}
export function foundationWeekPassed(state:FoundationState,week:number){
 const chapters=foundationChapters(week);
 return chapters.length>0&&chapters.every(rule=>foundationChapterPassed(state,rule));
}
