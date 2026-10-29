import type {FoundationCheckPort} from '../domain/content-repository';
import {NotFoundError,ValidationError} from '../domain/errors';
/** Corrige un minitest de Fundamentos v2. La respuesta correcta nunca sale del servidor antes de responder. */
export class GradeFoundationCheck {
  constructor(private readonly repository:FoundationCheckPort){}
  execute(questionId:string,optionId:string){
    const question=this.repository.foundationCheck(questionId);
    const key=this.repository.foundationKey(questionId);
    if(!question||!key)throw new NotFoundError('Minitest');
    if(!question.options.some(option=>option.id===optionId))throw new ValidationError('Opción inválida.');
    return {questionId,correct:optionId===key.correct,feedback:key.feedback[optionId]??''};
  }
}
