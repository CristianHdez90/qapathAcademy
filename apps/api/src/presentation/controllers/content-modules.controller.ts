import {BadRequestException,Body,Controller,Delete,Get,Inject,Param,Patch,Post,Query,Req,UseFilters,UseGuards} from '@nestjs/common';
import {ManageContentModules} from '@qapath/learning';
import {catalogRevisionSchema,catalogUuidSchema,moduleInputSchema,moduleQuerySchema,moduleUpdateSchema} from '@qapath/contracts';
import {Roles} from '../security/session-security';
import type {AuthenticatedRequest} from '../security/session-security';
import {CatalogExceptionFilter,CatalogWriteRateGuard} from './course-catalog.controller';
/** SPEC-CONTENT-331 · Módulos propios: crear, renombrar, describir, eliminar (recuperable) y restaurar. */
const parse=<T>(schema:{safeParse:(value:unknown)=>{success:true;data:T}|{success:false;error:{issues:{path:PropertyKey[];message:string}[]}}},value:unknown):T=>{
 const result=schema.safeParse(value);if(result.success)return result.data;
 const issue=result.error.issues[0];throw new BadRequestException({error:{code:'VALIDATION_ERROR',message:issue?`Revisa ${issue.path.join('.')||'la solicitud'}: ${issue.message}`:'Revisa los campos de la solicitud.'}});
};
@Controller('admin/modules')
@Roles('ADMIN')
@UseFilters(CatalogExceptionFilter)
@UseGuards(CatalogWriteRateGuard)
export class AdminModulesController{
 constructor(@Inject(ManageContentModules)private readonly modules:ManageContentModules){}
 @Get()async list(@Query()query:unknown){return {data:await this.modules.list(parse(moduleQuerySchema,query).deleted==='true')}}
 @Get(':id')async get(@Param('id')id:string){return {data:await this.modules.get(parse(catalogUuidSchema,id))}}
 @Post()async create(@Req()req:AuthenticatedRequest,@Body()body:unknown){return {data:await this.modules.create(req.user!.id,parse(moduleInputSchema,body))}}
 @Patch(':id')async update(@Req()req:AuthenticatedRequest,@Param('id')id:string,@Body()body:unknown){const {revision,...input}=parse(moduleUpdateSchema,body);return {data:await this.modules.update(req.user!.id,parse(catalogUuidSchema,id),revision,input)}}
 @Delete(':id')async remove(@Req()req:AuthenticatedRequest,@Param('id')id:string,@Body()body:unknown){return {data:await this.modules.remove(req.user!.id,parse(catalogUuidSchema,id),parse(catalogRevisionSchema,body).revision)}}
 @Post(':id/restore')async restore(@Req()req:AuthenticatedRequest,@Param('id')id:string,@Body()body:unknown){return {data:await this.modules.restore(req.user!.id,parse(catalogUuidSchema,id),parse(catalogRevisionSchema,body).revision)}}
}
