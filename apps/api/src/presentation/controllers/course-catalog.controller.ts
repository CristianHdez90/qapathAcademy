import {ArgumentsHost,BadRequestException,Body,Catch,Controller,ExceptionFilter,Get,Inject,Injectable,Param,Patch,Post,Delete,Query,Req,UseFilters,UseGuards,HttpException} from '@nestjs/common';
import type {CanActivate,ExecutionContext} from '@nestjs/common';
import {ManageCourseCatalog,CatalogError} from '@qapath/learning';
import type {ContentRepository,Course} from '@qapath/learning';
import {courseInputSchema,courseUpdateSchema,courseQuerySchema,adminCourseQuerySchema,catalogRevisionSchema,catalogUuidSchema,learningPathInputSchema,learningPathUpdateSchema} from '@qapath/contracts';
import {CONTENT_REPOSITORY} from '../../application/tokens';
import {Public,Roles} from '../security/session-security';
import type {AuthenticatedRequest} from '../security/session-security';
const FIELD:Record<string,string>={slug:'Slug (minúsculas, números y guiones)',title:'Título',summary:'Resumen',description:'Descripción',category:'Categoría',skills:'Habilidades',position:'Orden editorial',cover:'Portada (/course-covers/archivo.webp o vacía)',contentKind:'Origen del contenido',assignments:'Contenido asignado',revision:'Revisión',status:'Visibilidad'};
const parse=<T>(schema:{safeParse:(value:unknown)=>{success:true;data:T}|{success:false;error:{issues:{path:PropertyKey[]}[]}}},value:unknown):T=>{const result=schema.safeParse(value);if(result.success)return result.data;const field=String(result.error.issues[0]?.path[0]??'');throw new BadRequestException({error:{code:'VALIDATION_ERROR',message:FIELD[field]?`Revisa el campo: ${FIELD[field]}.`:'Revisa los campos de la solicitud.'}})};
/** Bounded per-process backstop; existing session/Origin guards remain authoritative. */
@Injectable()
export class CatalogWriteRateGuard implements CanActivate{
 private readonly windows=new Map<string,{until:number;count:number}>();
 canActivate(context:ExecutionContext){const request=context.switchToHttp().getRequest<AuthenticatedRequest>();if(request.method==='GET')return true;const actor=request.user?.id;if(!actor)return true;const now=Date.now();let item=this.windows.get(actor);if(!item||item.until<=now){for(const [key,value] of this.windows)if(value.until<=now)this.windows.delete(key);if(this.windows.size>=10000)throw new HttpException('Servicio ocupado. Reintenta más tarde.',429);item={until:now+60000,count:0};this.windows.set(actor,item)}if(++item.count>60)throw new HttpException('Demasiados cambios. Espera un minuto antes de reintentar.',429);return true}
}
@Catch(CatalogError)
export class CatalogExceptionFilter implements ExceptionFilter{
 catch(error:CatalogError,host:ArgumentsHost){const status=error.code==='NOT_FOUND'?404:error.code==='CONFLICT'||error.code==='LIMIT'?409:400;host.switchToHttp().getResponse().status(status).json({error:{code:error.code,message:error.message}})}
}
@Controller('courses')
@Public()
@UseFilters(CatalogExceptionFilter)
export class CourseCatalogController{
 constructor(@Inject(ManageCourseCatalog)private readonly catalog:ManageCourseCatalog,@Inject(CONTENT_REPOSITORY)private readonly content:ContentRepository){}
 private metadata(course:Course){const onlyWeeks=course.assignments.length>0&&course.assignments.every(ref=>ref.kind==='LEGACY_MODULE');return {...course,...(onlyWeeks?{weeks:[...new Set(course.assignments.flatMap(ref=>this.content.module(ref.ref)?.weeks||[]))]}:{})}}
 @Get()async list(@Query()query:unknown){const page=await this.catalog.list(parse(courseQuerySchema,query));return {data:{...page,items:page.items.map(course=>this.metadata(course))}}}
 @Get(':slug')async get(@Param('slug')slug:string){if(!/^[a-z0-9-]{3,100}$/.test(slug))throw new BadRequestException('Slug inválido.');return {data:this.metadata(await this.catalog.get(slug))}}
}
@Controller('admin/courses')
@Roles('ADMIN')
@UseFilters(CatalogExceptionFilter)
@UseGuards(CatalogWriteRateGuard)
export class AdminCoursesController{
 constructor(@Inject(ManageCourseCatalog)private readonly catalog:ManageCourseCatalog){}
 @Get()async list(@Query()query:unknown){return {data:await this.catalog.list(parse(adminCourseQuerySchema,query),true)}}
 @Get(':id')async get(@Param('id')id:string){return {data:await this.catalog.get(parse(catalogUuidSchema,id),true)}}
 @Post()async create(@Req()req:AuthenticatedRequest,@Body()body:unknown){return {data:await this.catalog.create(req.user!.id,parse(courseInputSchema,body))}}
 @Patch(':id')async update(@Req()req:AuthenticatedRequest,@Param('id')id:string,@Body()body:unknown){const {revision,status,...input}=parse(courseUpdateSchema,body);return {data:await this.catalog.update(req.user!.id,parse(catalogUuidSchema,id),revision,input,status)}}
 @Delete(':id')async archive(@Req()req:AuthenticatedRequest,@Param('id')id:string,@Body()body:unknown){return {data:await this.catalog.archive(req.user!.id,parse(catalogUuidSchema,id),parse(catalogRevisionSchema,body).revision)}}
 @Post(':id/restore')async restore(@Req()req:AuthenticatedRequest,@Param('id')id:string,@Body()body:unknown){return {data:await this.catalog.restore(req.user!.id,parse(catalogUuidSchema,id),parse(catalogRevisionSchema,body).revision)}}
}
@Controller('me/learning-paths')
@Roles('STUDENT')
@UseFilters(CatalogExceptionFilter)
@UseGuards(CatalogWriteRateGuard)
export class PersonalPathsController{
 constructor(@Inject(ManageCourseCatalog)private readonly catalog:ManageCourseCatalog){}
 @Get()async list(@Req()req:AuthenticatedRequest){return {data:await this.catalog.listPaths(req.user!.id)}}
 @Get(':id')async get(@Req()req:AuthenticatedRequest,@Param('id')id:string){return {data:await this.catalog.getPath(req.user!.id,parse(catalogUuidSchema,id))}}
 @Post()async create(@Req()req:AuthenticatedRequest,@Body()body:unknown){return {data:await this.catalog.savePath(req.user!.id,undefined,parse(learningPathInputSchema,body))}}
 @Patch(':id')async update(@Req()req:AuthenticatedRequest,@Param('id')id:string,@Body()body:unknown){return {data:await this.catalog.savePath(req.user!.id,parse(catalogUuidSchema,id),parse(learningPathUpdateSchema,body))}}
 @Delete(':id')async remove(@Req()req:AuthenticatedRequest,@Param('id')id:string,@Body()body:unknown){await this.catalog.removePath(req.user!.id,parse(catalogUuidSchema,id),parse(catalogRevisionSchema,body).revision);return {data:{removed:true}}}
}
