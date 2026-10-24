import type {ScrumPort} from '../domain/content-repository';
/** Expone solo preguntas públicas; la evaluación se ejecuta en servidor. */
export class GetScrum {
  constructor(private readonly repository:ScrumPort){}
  execute(){const {roles,steps,events,quiz}=this.repository.scrum();return {roles,steps,events,questions:quiz.map(({q,a})=>({q,a}))};}
}
