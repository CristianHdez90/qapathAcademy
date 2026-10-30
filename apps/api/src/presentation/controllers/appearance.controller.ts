import {BadRequestException,Body,ConflictException,Controller,Get,Header,HttpCode,Inject,Patch,Post,Query,Req,UnprocessableEntityException} from '@nestjs/common';
import {AppearanceConflict,AppearanceInvalid,ManageAppearance} from '@qapath/administration';
import {appearanceDraftRequestSchema,appearancePublishRequestSchema,appearanceRestoreRequestSchema,type AppearanceConfig} from '@qapath/contracts';
import {Public,Roles} from '../security/session-security';
import type {AuthenticatedRequest} from '../security/session-security';
const toPublic=(value:{config:AppearanceConfig;revision:number;publishedAt:Date|null;fallback:boolean})=>({revision:value.revision,publishedAt:value.publishedAt?.toISOString()??null,config:value.config,fallback:value.fallback});
function errors(error:unknown):never{
 if(error instanceof AppearanceConflict)throw new ConflictException(error.message);
 if(error instanceof AppearanceInvalid)throw new UnprocessableEntityException({message:error.message,issues:error.issues});
 throw error;
}
/** SPEC-UX-310 · Lectura pública: únicamente la configuración publicada (o el preset inicial). */
@Controller('appearance')
export class AppearanceController{
 constructor(@Inject(ManageAppearance) private readonly appearance:ManageAppearance<AppearanceConfig>){}
 @Public() @Get('home') @Header('Cache-Control','no-store') async home(){return {data:toPublic(await this.appearance.published())}}
}
/** SPEC-UX-310 · Administración: borrador, publicación, versiones y restauración (RBAC en el servidor). */
@Controller('admin/appearance/home')
@Roles('ADMIN')
export class AdminAppearanceController{
 constructor(@Inject(ManageAppearance) private readonly appearance:ManageAppearance<AppearanceConfig>){}
 @Get() @Header('Cache-Control','no-store') async view(){const value=await this.appearance.adminView();return {data:{draft:value.draft,draftRevision:value.draftRevision,draftUpdatedAt:value.draftUpdatedAt?.toISOString()??null,published:toPublic(value.published),issues:value.issues}}}
 @Patch('draft') @Header('Cache-Control','no-store') async draft(@Req()request:AuthenticatedRequest,@Body()body:unknown){
  const parsed=appearanceDraftRequestSchema.safeParse(body);
  if(!parsed.success)throw new BadRequestException({message:'Configuración inválida: solo se aceptan tokens, textos planos y presentación de cursos autorizados.',fields:parsed.error.issues.slice(0,10).map(issue=>({path:issue.path.join('.'),message:issue.message}))});
  try{return {data:await this.appearance.saveDraft(parsed.data.config,parsed.data.expectedRevision,request.user!.id)}}catch(error){errors(error)}
 }
 @Post('publish') @HttpCode(200) @Header('Cache-Control','no-store') async publish(@Req()request:AuthenticatedRequest,@Body()body:unknown){
  const parsed=appearancePublishRequestSchema.safeParse(body);if(!parsed.success)throw new BadRequestException('Indica la revisión del borrador que quieres publicar.');
  try{return {data:await this.appearance.publish(parsed.data.expectedRevision,request.user!.id)}}catch(error){errors(error)}
 }
 @Get('versions') @Header('Cache-Control','no-store') async versions(@Query('limit')limit?:string){
  const list=await this.appearance.versions(Number(limit)||30);
  return {data:list.map(item=>({version:item.version,action:item.action,createdAt:item.createdAt.toISOString(),actorEmail:item.actorEmail,preset:item.config.preset}))};
 }
 @Post('restore') @HttpCode(200) @Header('Cache-Control','no-store') async restore(@Req()request:AuthenticatedRequest,@Body()body:unknown){
  const parsed=appearanceRestoreRequestSchema.safeParse(body);if(!parsed.success)throw new BadRequestException('Indica la versión a restaurar y la revisión actual.');
  try{return {data:await this.appearance.restore(parsed.data.version,parsed.data.expectedRevision,request.user!.id)}}catch(error){errors(error)}
 }
}
