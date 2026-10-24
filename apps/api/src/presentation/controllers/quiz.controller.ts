import {Public} from '../security/session-security';
import {BadRequestException,Body,Controller,Inject,Param,Post,UseFilters} from '@nestjs/common';
import {GradeQuiz} from '@qapath/learning';
import {gradeQuizRequestSchema} from '@qapath/contracts';
import {USE_CASES} from '../../application/tokens';
import {DomainExceptionFilter} from '../filters/domain-exception.filter';
@Controller('quizzes')
@UseFilters(DomainExceptionFilter)
@Public()
export class QuizController {
 constructor(@Inject(USE_CASES.gradeQuiz)private readonly gradeQuiz:GradeQuiz){}
 @Post(':moduleId/grade')grade(@Param('moduleId')moduleId:string,@Body()body:unknown){
  const parsed=gradeQuizRequestSchema.safeParse(body);
  if(!parsed.success)throw new BadRequestException({error:{code:'VALIDATION_ERROR',message:'Respuestas inválidas.'}});
  return {data:this.gradeQuiz.execute(moduleId,parsed.data.answers)};
 }
}
