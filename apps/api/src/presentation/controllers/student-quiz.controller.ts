import {Roles} from '../security/session-security';
import {BadRequestException,Body,Controller,Inject,Param,Post,Req,UseFilters} from '@nestjs/common';
import {GradeQuiz} from '@qapath/learning';
import {gradeQuizRequestSchema} from '@qapath/contracts';
import type {StudentProgressPort} from '@qapath/progress';
import {DomainExceptionFilter} from '../filters/domain-exception.filter';
import {USE_CASES,PROGRESS_REPOSITORY} from '../../application/tokens';
import type {AuthenticatedRequest} from '../security/session-security';
@Controller('me/quizzes')
@Roles('STUDENT')
@UseFilters(DomainExceptionFilter)
export class StudentQuizController {
 constructor(@Inject(USE_CASES.gradeQuiz)private readonly grade:GradeQuiz,@Inject(PROGRESS_REPOSITORY)private readonly progress:StudentProgressPort){}
 @Post(':moduleId/grade')async submit(@Req()req:AuthenticatedRequest,@Param('moduleId')moduleId:string,@Body()input:unknown){
  const parsed=gradeQuizRequestSchema.safeParse(input);
  if(!parsed.success)throw new BadRequestException('Respuestas inválidas.');
  const result=this.grade.execute(moduleId,parsed.data.answers);
  await this.progress.apply(req.user!.id,{type:'grade',moduleId,score:result.percent});
  if(moduleId==='scrum')await this.progress.apply(req.user!.id,{type:'scrum-grade',score:result.percent});
  return {data:result};
 }
}
