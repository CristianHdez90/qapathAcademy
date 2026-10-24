import type {Module,Week,Question,StudyGuide,Lab,Resource,ScrumRole,ScrumStep,ScrumEvent} from './models';

/** Puertos mínimos por caso de uso: Interface Segregation Principle (ISP). */
export interface ModuleCatalogPort {
  modules(): Module[];
  weeks(): Week[];
  module(id:string): Module | undefined;
}
export interface ModuleDetailPort extends ModuleCatalogPort {
  quiz(moduleId:string):Question[] | undefined;
  labs():Lab[];
  resources():Resource[];
}
export interface ResourcesPort { resources():Resource[]; }
export interface ProjectChecklistPort { checklist():string[]; }
export interface LessonPort {
  week(id:number):Week | undefined;
  guide(week:number):StudyGuide | undefined;
}
export interface ScrumPort {
  scrum():{roles:ScrumRole[];steps:ScrumStep[];events:ScrumEvent[];quiz:Question[]};
}
export interface QuizPort extends ScrumPort {
  quiz(moduleId:string):Question[] | undefined;
}
/** Composición de puertos que satisface un adaptador completo; los casos de uso no dependen de ella. */
export interface ContentRepository extends ModuleDetailPort,LessonPort,QuizPort,ResourcesPort,ProjectChecklistPort {}
