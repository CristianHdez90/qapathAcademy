import {BadRequestException,ConflictException,ForbiddenException,NotFoundException,Body,Controller,Get,Inject,Param,ParseUUIDPipe,Patch,Post,Query,Req} from '@nestjs/common';
import {ManageStudents,AdminDomainError} from '@qapath/administration';
import {auditQuerySchema,changeStudentSchema,listStudentsSchema,newStudentSchema} from '@qapath/contracts';
import {SecureAuthenticationService} from '@qapath/identity';
import {Roles} from '../security/session-security';
import type {AuthenticatedRequest} from '../security/session-security';

function validated<T>(result:{success:true;data:T}|{success:false}):T{
 if(!result.success)throw new BadRequestException('Datos de administración inválidos.');return result.data;
}
function errors(error:unknown):never{
 if(error instanceof AdminDomainError){if(error.status===404)throw new NotFoundException(error.message);if(error.status===403)throw new ForbiddenException(error.message);if(error.status===409)throw new ConflictException(error.message);throw new BadRequestException(error.message);}
 throw error;
}
@Controller('admin')
@Roles('ADMIN')
export class AdminController {
 constructor(@Inject(ManageStudents) private readonly admin:ManageStudents,private readonly security:SecureAuthenticationService){}
 @Get('status') status(){return {data:{adminAccess:true}};}
 @Get('summary') async summary(){return {data:await this.admin.metrics()};}
 @Get('students')async list(@Query() query:unknown){const q=validated(listStudentsSchema.safeParse(query));return {data:await this.admin.list(q.search,q.status,q.page,q.limit)};}
 @Post('students')async create(@Req()request:AuthenticatedRequest,@Body()body:unknown){const data=validated(newStudentSchema.safeParse(body));try{const created=await this.admin.create(data.email,data.password,request.user!.id);await this.security.resendVerification(created.email);return {data:created};}catch(e){errors(e)}}
 @Get('students/:id')async detail(@Param('id',ParseUUIDPipe)id:string){try{return {data:await this.admin.detail(id)};}catch(e){errors(e)}}
 @Patch('students/:id')async modify(@Param('id',ParseUUIDPipe)id:string,@Req()request:AuthenticatedRequest,@Body()body:unknown){const data=validated(changeStudentSchema.safeParse(body));try{const changed=await this.admin.change(id,request.user!.id,data);if(data.email)await this.security.resendVerification(changed.email);return {data:changed};}catch(e){errors(e)}}
 @Get('students/:id/events')async history(@Param('id',ParseUUIDPipe)id:string){try{await this.admin.detail(id);return {data:await this.admin.history(id,50)}}catch(e){errors(e)}}
 @Get('audit')async audit(@Query()query:unknown){const q=validated(auditQuerySchema.safeParse(query));return {data:await this.admin.audit(q.studentId,q.page,q.limit)};}
}
