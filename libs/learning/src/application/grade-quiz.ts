import type {QuizPort} from '../domain/content-repository';
import type {QuizResult} from '../domain/models';
import {NotFoundError} from '../domain/errors';
import {Quiz} from '../domain/quiz';
export class GradeQuiz {
 constructor(private readonly repository:QuizPort){}
 execute(moduleId:string,answers:number[]):QuizResult {
   const questions=moduleId==='scrum'?this.repository.scrum().quiz:this.repository.quiz(moduleId);
   if(!questions)throw new NotFoundError('Cuestionario');
   return Quiz.from(questions).grade(answers);
 }
}
