import type {Question,QuizResult} from './models';
import {ValidationError} from './errors';
/** Aggregate Root: validación de invariantes y cálculo de calificación. */
export class Quiz {
  private constructor(private readonly questions:readonly Question[]) {}
  static from(questions:readonly Question[]):Quiz {
    if(!questions.length)throw new ValidationError('El cuestionario debe contener preguntas.');
    for(const q of questions){
      if(q.a.length<2||!Number.isInteger(q.correct)||q.correct<0||q.correct>=q.a.length)
        throw new ValidationError('La definición del cuestionario es inválida.');
    }
    return new Quiz(questions);
  }
  grade(answers:readonly number[]):QuizResult {
    if(answers.length!==this.questions.length||answers.some((answer,i)=>!Number.isInteger(answer)||answer<0||answer>=this.questions[i].a.length))
      throw new ValidationError('Debes responder todas las preguntas con una opción válida.');
    const feedback=this.questions.map((q,i)=>({correct:q.correct===answers[i],expected:q.correct,reason:q.why}));
    const score=feedback.filter(item=>item.correct).length;
    return {score,total:this.questions.length,percent:Math.round(100*score/this.questions.length),feedback};
  }
}
