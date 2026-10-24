import type {ProgressRepository} from '../domain/progress-repository';
import type {Progress} from '../domain/progress';
import {toggleInArray} from '../domain/progress';
export type Collection='weeks'|'read'|'tasks'|'labs'|'final';
/** Un único caso de uso reutilizado por UI sin acoplarlo al navegador. */
export class UpdateProgress {
  constructor(private readonly repository:ProgressRepository){}
  toggle<K extends Collection>(key:K,value:Progress[K][number]):Progress {
    const state=this.repository.read();
    const updated={...state,[key]:toggleInArray(state[key] as typeof value[],value)} as Progress;
    this.repository.save(updated);return updated;
  }
  note(week:number,text:string):Progress {
    const state=this.repository.read();const updated={...state,notes:{...state.notes,[String(week)]:text.slice(0,8000)}};
    this.repository.save(updated);return updated;
  }
  grade(id:string,score:number):Progress{
    const state=this.repository.read();const updated={...state,quizzes:{...state.quizzes,[id]:Math.max(state.quizzes[id]??0,score)}};
    this.repository.save(updated);return updated;
  }
  markScrum(score?:number):Progress{
    const state=this.repository.read();const updated={...state,scrumQuizScore:Math.max(state.scrumQuizScore,score??0)};
    this.repository.save(updated);return updated;
  }
  toggleScrumIntro():Progress{
    const state=this.repository.read();const updated={...state,scrumIntro:!state.scrumIntro};
    this.repository.save(updated);return updated;
  }
}
