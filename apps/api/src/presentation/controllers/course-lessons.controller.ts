import {BadRequestException,Body,Controller,Delete,Get,Inject,Param,Patch,Post,Query,Req,UseFilters,UseGuards} from '@nestjs/common';
import {ManageCourseLessons} from '@qapath/learning';
import {catalogRevisionSchema,catalogUuidSchema,lessonInputSchema,lessonLibraryQuerySchema,lessonUpdateSchema} from '@qapath/contracts';
import {Public,Roles} from '../security/session-security';
import type {AuthenticatedRequest} from '../security/session-security';
import {CatalogExceptionFilter,CatalogWriteRateGuard} from './course-catalog.controller';
/** SPEC-CONTENT-320/321 · Biblioteca de contenido por archivos y lecciones asignadas a cursos. */
const parse=<T>(schema:{safeParse:(value:unknown)=>{success:true;data:T}|{success:false;error:{issues:{path:PropertyKey[];message:string}[]}}},value:unknown):T=>{
 const result=schema.safeParse(value);if(result.success)return result.data;
 const issue=result.error.issues[0];throw new BadRequestException({error:{code:'VALIDATION_ERROR',message:issue?`Revisa ${issue.path.join('.')||'la solicitud'}: ${issue.message}`:'Revisa los campos de la solicitud.'}});
};
const slugOf=(slug:string)=>{if(!/^[a-z0-9-]{3,100}$/.test(slug))throw new BadRequestException('Slug inválido.');return slug};
@Controller('courses/:slug/lessons')
@Public()
@UseFilters(CatalogExceptionFilter)
export class CourseLessonsController{
 constructor(@Inject(ManageCourseLessons)private readonly lessons:ManageCourseLessons){}
 @Get()async list(@Param('slug')slug:string){return {data:await this.lessons.forCourse(slugOf(slug))}}
 @Get(':lessonId')async get(@Param('slug')slug:string,@Param('lessonId')lessonId:string){return {data:await this.lessons.getForCourse(slugOf(slug),parse(catalogUuidSchema,lessonId))}}
}
@Controller('admin/lessons')
@Roles('ADMIN')
@UseFilters(CatalogExceptionFilter)
@UseGuards(CatalogWriteRateGuard)
export class AdminCourseLessonsController{
 constructor(@Inject(ManageCourseLessons)private readonly lessons:ManageCourseLessons){}
 @Get()async list(@Query()query:unknown){const q=parse(lessonLibraryQuerySchema,query);return {data:await this.lessons.library({search:q.search,deleted:q.deleted==='true'})}}
 @Get(':id')async get(@Param('id')id:string){return {data:await this.lessons.get(parse(catalogUuidSchema,id))}}
 @Post()async create(@Req()req:AuthenticatedRequest,@Body()body:unknown){return {data:await this.lessons.create(req.user!.id,parse(lessonInputSchema,body))}}
 @Patch(':id')async update(@Req()req:AuthenticatedRequest,@Param('id')id:string,@Body()body:unknown){const {revision,...input}=parse(lessonUpdateSchema,body);return {data:await this.lessons.update(req.user!.id,parse(catalogUuidSchema,id),revision,input)}}
 @Delete(':id')async remove(@Req()req:AuthenticatedRequest,@Param('id')id:string,@Body()body:unknown){return {data:await this.lessons.remove(req.user!.id,parse(catalogUuidSchema,id),parse(catalogRevisionSchema,body).revision)}}
 @Post(':id/restore')async restore(@Req()req:AuthenticatedRequest,@Param('id')id:string,@Body()body:unknown){return {data:await this.lessons.restore(req.user!.id,parse(catalogUuidSchema,id),parse(catalogRevisionSchema,body).revision)}}
}
