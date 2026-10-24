import type {ModuleDetailPort} from '../domain/content-repository';
import {NotFoundError} from '../domain/errors';
export class GetModule {
  constructor(private readonly repository:ModuleDetailPort) {}
  execute(id:string){
    const module=this.repository.module(id);
    if(!module) throw new NotFoundError('Módulo');
    const weeks=this.repository.weeks().filter(w=>w.module===id);
    const quiz=(this.repository.quiz(id)||[]).map(({q,a})=>({q,a}));
    return {module,weeks,quiz,labs:this.repository.labs().filter(l=>l.module===id),resources:this.repository.resources().filter(r=>r.module===id)};
  }
}
