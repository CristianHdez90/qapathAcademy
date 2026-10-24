import {Public} from '../security/session-security';
import {Controller,Get,Inject,Param,UseFilters} from '@nestjs/common';
import {GetLesson,GetModule,GetScrum,ListModules,ValidationError,ListResources,GetProjectChecklist} from '@qapath/learning';
import {USE_CASES} from '../../application/tokens';
import {DomainExceptionFilter} from '../filters/domain-exception.filter';
@Controller()
@UseFilters(DomainExceptionFilter)
@Public()
export class CatalogController {
 constructor(
  @Inject(USE_CASES.listModules)private readonly listModules:ListModules,
  @Inject(USE_CASES.getModule)private readonly getModule:GetModule,
  @Inject(USE_CASES.getLesson)private readonly getLesson:GetLesson,
  @Inject(USE_CASES.getScrum)private readonly getScrum:GetScrum,
  @Inject(USE_CASES.listResources)private readonly listResources:ListResources,
  @Inject(USE_CASES.getProjectChecklist)private readonly getProjectChecklist:GetProjectChecklist
 ){}
 @Get('modules')modules(){return {data:this.listModules.execute()};}
 @Get('modules/:moduleId')module(@Param('moduleId')id:string){return {data:this.getModule.execute(id)};}
 @Get('lessons/:week')lesson(@Param('week')raw:string){
  if(!/^\d{1,5}$/.test(raw))throw new ValidationError('Semana inválida.');
  return {data:this.getLesson.execute(Number(raw))};
 }
 @Get('scrum')scrum(){return {data:this.getScrum.execute()};}
 @Get('resources')resources(){return {data:this.listResources.execute()};}
 @Get('project/checklist')checklist(){return {data:this.getProjectChecklist.execute()};}
}
