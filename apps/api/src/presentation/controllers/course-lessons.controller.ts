import {BadRequestException,Body,Controller,Delete,Get,Inject,Param,Patch,Post,Put,Req,UseFilters,UseGuards} from '@nestjs/common';
import {ManageCourseLessons} from '@qapath/learning';
import {catalogRevisionSchema,catalogUuidSchema,lessonInputSchema,lessonReorderSchema,lessonUpdateSchema} from '@qapath/contracts';
import {Public,Roles} from '../security/session-security';
import type {AuthenticatedRequest} from '../security/session-security';
import {CatalogExceptionFilter,CatalogWriteRateGuard} from './course-catalog.controller';
/** SPEC-CONTENT-320 · Contenido de estudio por archivos. */
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
 @Get()async list(@Param('slug')slug:string){return {data:await this.lessons.list(slugOf(slug))}}
 @Get(':lessonId')async get(@Param('slug')slug:string,@Param('lessonId')lessonId:string){return {data:await this.lessons.get(slugOf(slug),parse(catalogUuidSchema,lessonId))}}
}
@Controller('admin/courses/:id/lessons')
@Roles('ADMIN')
@UseFilters(CatalogExceptionFilter)
@UseGuards(CatalogWriteRateGuard)
export class AdminCourseLessonsController{
 constructor(@Inject(ManageCourseLessons)private readonly lessons:ManageCourseLessons){}
 @Get()async list(@Param('id')id:string){return {data:await this.lessons.list(parse(catalogUuidSchema,id),true)}}
 @Put('order')async reorder(@Req()req:AuthenticatedRequest,@Param('id')id:string,@Body()body:unknown){return {data:await this.lessons.reorder(req.user!.id,parse(catalogUuidSchema,id),parse(lessonReorderSchema,body).order)}}
 @Get(':lessonId')async get(@Param('id')id:string,@Param('lessonId')lessonId:string){return {data:await this.lessons.get(parse(catalogUuidSchema,id),parse(catalogUuidSchema,lessonId),true)}}
 @Post()async create(@Req()req:AuthenticatedRequest,@Param('id')id:string,@Body()body:unknown){return {data:await this.lessons.create(req.user!.id,parse(catalogUuidSchema,id),parse(lessonInputSchema,body))}}
 @Patch(':lessonId')async update(@Req()req:AuthenticatedRequest,@Param('id')id:string,@Param('lessonId')lessonId:string,@Body()body:unknown){return {data:await this.lessons.update(req.user!.id,parse(catalogUuidSchema,id),parse(catalogUuidSchema,lessonId),parse(lessonUpdateSchema,body))}}
 @Delete(':lessonId')async archive(@Req()req:AuthenticatedRequest,@Param('id')id:string,@Param('lessonId')lessonId:string,@Body()body:unknown){return {data:await this.lessons.archive(req.user!.id,parse(catalogUuidSchema,id),parse(catalogUuidSchema,lessonId),parse(catalogRevisionSchema,body).revision)}}
 @Post(':lessonId/restore')async restore(@Req()req:AuthenticatedRequest,@Param('id')id:string,@Param('lessonId')lessonId:string,@Body()body:unknown){return {data:await this.lessons.restore(req.user!.id,parse(catalogUuidSchema,id),parse(catalogUuidSchema,lessonId),parse(catalogRevisionSchema,body).revision)}}
}
