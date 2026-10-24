import {contentSnapshot} from '@qapath/content';
import type {ContentRepository,Module,Week,StudyGuide,Question,Lab,Resource,ScrumRole,ScrumStep,ScrumEvent} from '@qapath/learning';
/** Adaptador de salida Hexagonal: implementa puertos del núcleo. */
export class JsonContentAdapter implements ContentRepository {
 private readonly data=contentSnapshot;
 modules(){return this.data.catalog.modules as Module[];}
 weeks(){return this.data.catalog.weeks as Week[];}
 module(id:string){return this.modules().find(m=>m.id===id);}
 week(id:number){return this.weeks().find(w=>w.id===id);}
 guide(id:number){return (this.data.guides as Record<string,StudyGuide>)[String(id)];}
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
