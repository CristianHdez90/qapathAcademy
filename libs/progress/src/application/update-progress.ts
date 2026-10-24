import type {ProgressRepository} from '../domain/progress-repository';
import type {Progress} from '../domain/progress';
import {fromUnknown} from '../domain/progress';
import {applyProgressCommand} from '../domain/progress-commands';
export type Collection='weeks'|'read'|'tasks'|'labs'|'final';
/** Un único caso de uso reutilizado por UI sin acoplarlo al navegador. */
export class UpdateProgress {
  constructor(private readonly repository:ProgressRepository){}
  toggle<K extends Collection>(key:K,value:Progress[K][number]):Progress {
    const state=this.repository.read();
    const updated=applyProgressCommand(state,{type:'toggle',key,value});
    this.repository.save(updated);return updated;
  }
  note(week:number,text:string):Progress {
    const state=this.repository.read();const updated=fromUnknown({...state,notes:{...state.notes,[String(week)]:text.slice(0,8000)}});
    this.repository.save(updated);return updated;
  }
  grade(id:string,score:number):Progress{
    const state=this.repository.read();const updated=applyProgressCommand(state,{type:'grade',moduleId:id,score});
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
