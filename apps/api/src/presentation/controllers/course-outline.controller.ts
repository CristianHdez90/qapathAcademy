import {BadRequestException,Body,Controller,Get,HttpCode,Inject,Param,Post,Put,Req,UseFilters,UseGuards} from '@nestjs/common';
import {ManageCourseOutline} from '@qapath/learning';
import {catalogUuidSchema,outlineDraftSchema,outlineGradeSchema,outlineReadSchema,outlineRevisionSchema} from '@qapath/contracts';
import {Public,Roles} from '../security/session-security';
import type {AuthenticatedRequest} from '../security/session-security';
import {CatalogExceptionFilter,CatalogWriteRateGuard} from './course-catalog.controller';
import {fundamentalsOutline} from '../../infrastructure/adapters/fundamentals-outline';
/** SPEC-CONTENT-330 · Contenido del curso (semanas, capítulos, tarjetas y minitests). */
const parse=<T>(schema:{safeParse:(value:unknown)=>{success:true;data:T}|{success:false;error:{issues:{path:PropertyKey[];message:string}[]}}},value:unknown):T=>{
 const result=schema.safeParse(value);if(result.success)return result.data;
 const issue=result.error.issues[0];throw new BadRequestException({error:{code:'VALIDATION_ERROR',message:issue?`Revisa ${issue.path.join('.')||'la solicitud'}: ${issue.message}`:'Revisa los campos de la solicitud.'}});
};
const slugOf=(slug:string)=>{if(!/^[a-z0-9-]{3,100}$/.test(slug))throw new BadRequestException('Slug inválido.');return slug};
const chapterOf=(id:string)=>{if(!/^[A-Za-z0-9_-]{1,64}$/.test(id))throw new BadRequestException('Capítulo inválido.');return id};
@Controller('admin/courses/:id/outline')
@Roles('ADMIN')
@UseFilters(CatalogExceptionFilter)
@UseGuards(CatalogWriteRateGuard)
export class AdminCourseOutlineController{
 constructor(@Inject(ManageCourseOutline)private readonly outline:ManageCourseOutline){}
 @Get()async get(@Param('id')id:string){return {data:await this.outline.admin(parse(catalogUuidSchema,id))}}
 @Put('draft')async save(@Req()req:AuthenticatedRequest,@Param('id')id:string,@Body()body:unknown){const input=parse(outlineDraftSchema,body);return {data:await this.outline.saveDraft(req.user!.id,parse(catalogUuidSchema,id),input.expectedRevision,input.outline)}}
 @Post('publish')@HttpCode(200)async publish(@Req()req:AuthenticatedRequest,@Param('id')id:string,@Body()body:unknown){return {data:await this.outline.publish(req.user!.id,parse(catalogUuidSchema,id),parse(outlineRevisionSchema,body).expectedRevision)}}
 @Post('unpublish')@HttpCode(200)async unpublish(@Req()req:AuthenticatedRequest,@Param('id')id:string){return {data:await this.outline.unpublish(req.user!.id,parse(catalogUuidSchema,id))}}
 @Post('discard')@HttpCode(200)async discard(@Req()req:AuthenticatedRequest,@Param('id')id:string,@Body()body:unknown){return {data:await this.outline.discard(req.user!.id,parse(catalogUuidSchema,id),parse(outlineRevisionSchema,body).expectedRevision)}}
 /** Copia editable de Fundamentos v2 como borrador: lo publicado no cambia hasta publicar. */
 @Post('import-fundamentals')@HttpCode(200)async importFundamentals(@Req()req:AuthenticatedRequest,@Param('id')id:string,@Body()body:unknown){return {data:await this.outline.saveDraft(req.user!.id,parse(catalogUuidSchema,id),parse(outlineRevisionSchema,body).expectedRevision,fundamentalsOutline(),'OUTLINE_FUNDAMENTALS_IMPORTED')}}
}
@Controller('courses/:slug/outline')
@Public()
@UseFilters(CatalogExceptionFilter)
export class CourseOutlineController{
 constructor(@Inject(ManageCourseOutline)private readonly outline:ManageCourseOutline){}
 @Get()async read(@Param('slug')slug:string){return {data:await this.outline.read(slugOf(slug))}}
 /** Calificación sin guardar avance (visitantes y vista previa del ADMIN). Los estudiantes usan /me/…/grade. */
 @Post('chapters/:chapterId/grade')@HttpCode(200)async grade(@Param('slug')slug:string,@Param('chapterId')chapterId:string,@Body()body:unknown){
  return {data:await this.outline.grade(slugOf(slug),chapterOf(chapterId),parse(outlineGradeSchema,body).answers)};
 }
}
@Controller('me/courses/:slug/outline-progress')
@Roles('STUDENT')
@UseFilters(CatalogExceptionFilter)
@UseGuards(CatalogWriteRateGuard)
export class OutlineProgressController{
 constructor(@Inject(ManageCourseOutline)private readonly outline:ManageCourseOutline){}
 @Get()async get(@Req()req:AuthenticatedRequest,@Param('slug')slug:string){return {data:await this.outline.progress(req.user!.id,slugOf(slug))}}
 @Post('chapters/:chapterId/grade')@HttpCode(200)async grade(@Req()req:AuthenticatedRequest,@Param('slug')slug:string,@Param('chapterId')chapterId:string,@Body()body:unknown){
  return {data:await this.outline.grade(slugOf(slug),chapterOf(chapterId),parse(outlineGradeSchema,body).answers,req.user!.id)};
 }
 @Post('read')@HttpCode(200)async read(@Req()req:AuthenticatedRequest,@Param('slug')slug:string,@Body()body:unknown){return {data:await this.outline.markRead(req.user!.id,slugOf(slug),parse(outlineReadSchema,body).cardIds)}}
}
