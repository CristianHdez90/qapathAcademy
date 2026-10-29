import {contentSnapshot,foundationAnswerKeys} from '@qapath/content';
import type {ContentRepository,Module,Week,StudyGuide,Question,Lab,Resource,ScrumRole,ScrumStep,ScrumEvent,FoundationWeek} from '@qapath/learning';
/** Adaptador de salida Hexagonal: implementa puertos del núcleo. */
export class JsonContentAdapter implements ContentRepository {
 private readonly data=contentSnapshot;
 modules(){return this.data.catalog.modules as Module[];}
 weeks(){return this.data.catalog.weeks as Week[];}
 module(id:string){return this.modules().find(m=>m.id===id);}
 week(id:number){return this.weeks().find(w=>w.id===id);}
 private foundationWeeks(){return this.data.foundation.weeks as unknown as Record<string,FoundationWeek>;}
 private closingTest(id:number){const module=this.modules().find(m=>m.weeks.at(-1)===id);if(!module||module.id==='fundamentos')return undefined;const quiz=this.quiz(module.id);return quiz?.length?{moduleId:module.id,moduleTitle:module.title,questions:quiz.map(q=>({q:q.q,a:q.a}))}:undefined;}
 guide(id:number){const guide=(this.data.guides as Record<string,StudyGuide>)[String(id)];const foundation=this.foundationWeeks()[String(id)];const closingTest=this.closingTest(id);return guide?{...guide,...(foundation?{foundation}:{}),...(closingTest?{closingTest}:{}),exercise:(this.data.exercises as Record<string,NonNullable<StudyGuide['exercise']>>)[String(id)]}:undefined;}
 foundationCheck(questionId:string){return Object.values(this.foundationWeeks()).flatMap(week=>week.chapters).flatMap(chapter=>chapter.cards).flatMap(card=>card.checks).find(check=>check.id===questionId);}
 foundationKey(questionId:string){return Object.hasOwn(foundationAnswerKeys,questionId)?foundationAnswerKeys[questionId]:undefined;}
 quiz(id:string){return (this.data.catalog.quizzes as Record<string,Question[]>)[id];}
 labs(){return this.data.catalog.labs as Lab[];}
 resources(){return this.data.catalog.resources as Resource[];}
 checklist(){return this.data.catalog.finalChecklist as string[];}
 scrum(){return {
  roles:this.data.scrum.roles as ScrumRole[],steps:this.data.scrum.steps as ScrumStep[],
  events:this.data.scrum.events as ScrumEvent[],
  quiz:this.data.scrum.quiz.map(q=>({q:q.q,a:q.choices,correct:q.correct,why:q.why})) as Question[]
 };}
}
