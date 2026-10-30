import {Public,Roles} from '../security/session-security';
import {BadRequestException,Body,Controller,Inject,Param,Post,Req,UseFilters} from '@nestjs/common';
import {GradeFoundationCheck} from '@qapath/learning';
import {foundationCheckRequestSchema} from '@qapath/contracts';
import type {StudentProgressPort} from '@qapath/progress';
import {DomainExceptionFilter} from '../filters/domain-exception.filter';
import {USE_CASES,PROGRESS_REPOSITORY} from '../../application/tokens';
import type {AuthenticatedRequest} from '../security/session-security';
const parse=(input:unknown)=>{
 const parsed=foundationCheckRequestSchema.safeParse(input);
 if(!parsed.success)throw new BadRequestException({error:{code:'VALIDATION_ERROR',message:'Respuesta inválida.'}});
 return parsed.data.optionId;
};
const questionPattern=/^FND-W0[12]-C0[1-8]-T\d{2}-Q\d$/;
/** Invitados: corrige y devuelve feedback sin guardar nada en el servidor. */
@Controller('foundation/checks')
@UseFilters(DomainExceptionFilter)
@Public()
export class FoundationCheckController {
 constructor(@Inject(USE_CASES.gradeFoundationCheck)private readonly grade:GradeFoundationCheck){}
 @Post(':questionId')check(@Param('questionId')questionId:string,@Body()input:unknown){
  if(!questionPattern.test(questionId))throw new BadRequestException('Minitest inválido.');
  return {data:{...this.grade.execute(questionId,parse(input)),credited:false}};
 }
}
/** Estudiantes: el servidor corrige y, solo si es correcto y la tarjeta está leída, acredita el minitest. */
@Controller('me/foundation/checks')
@Roles('STUDENT')
@UseFilters(DomainExceptionFilter)
export class StudentFoundationCheckController {
 constructor(@Inject(USE_CASES.gradeFoundationCheck)private readonly grade:GradeFoundationCheck,@Inject(PROGRESS_REPOSITORY)private readonly progress:StudentProgressPort){}
 @Post(':questionId')async check(@Req()req:AuthenticatedRequest,@Param('questionId')questionId:string,@Body()input:unknown){
  if(!questionPattern.test(questionId))throw new BadRequestException('Minitest inválido.');
  const result=this.grade.execute(questionId,parse(input));
  if(!result.correct)return {data:{...result,credited:false}};
  try{const state=await this.progress.apply(req.user!.id,{type:'foundation-check-passed',questionId});return {data:{...result,credited:true},progress:state};}
  catch(error){if(error instanceof Error&&/Minitest inválido/.test(error.message))return {data:{...result,credited:false}};throw error;}
 }
}
