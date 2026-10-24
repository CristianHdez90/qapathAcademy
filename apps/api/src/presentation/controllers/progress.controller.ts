import {Roles} from '../security/session-security';
import {BadRequestException,Body,Controller,Get,Patch,Post,Req} from '@nestjs/common';
import {progressCommandSchema} from '@qapath/contracts';
import type {StudentProgressPort,Progress} from '@qapath/progress';
import {fromUnknown} from '@qapath/progress';
import {Inject} from '@nestjs/common';
import {PROGRESS_REPOSITORY} from '../../application/tokens';
import type {AuthenticatedRequest} from '../security/session-security';
@Controller('me/progress')
@Roles('STUDENT')
export class ProgressController {
 constructor(@Inject(PROGRESS_REPOSITORY)private readonly progress:StudentProgressPort){}
 @Get()async read(@Req()request:AuthenticatedRequest){return {data:await this.progress.get(request.user!.id)};}
 @Patch()async mutate(@Req()request:AuthenticatedRequest,@Body()input:unknown){
  const parsed=progressCommandSchema.safeParse(input);if(!parsed.success)throw new BadRequestException('Cambio de progreso inválido.');
  try{return {data:await this.progress.apply(request.user!.id,parsed.data)}}
  catch(e){if(e instanceof Error&&/(inválid|inválida)/.test(e.message))throw new BadRequestException(e.message);throw e;}
 }
 @Post('import')async importBackup(@Req()request:AuthenticatedRequest,@Body()input:unknown){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new BadRequestException('Respaldo inválido.');
  const value=fromUnknown(input) as Progress;
  return {data:await this.progress.import(request.user!.id,value)};
 }
}
