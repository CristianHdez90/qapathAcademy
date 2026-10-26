import {BadRequestException,Body,Controller,Get,Header,Inject,Param,ParseUUIDPipe,Patch,Post,Query,Req} from '@nestjs/common';
import {qaChatSchema} from '../../application/qa-assistant';
import {QaAiAdapter} from '../../infrastructure/adapters/qa-ai.adapter';
import {QaQuotaAdapter} from '../../infrastructure/adapters/qa-quota.adapter';
import {QaConversationsAdapter} from '../../infrastructure/adapters/qa-conversations.adapter';
import type {AuthenticatedRequest} from '../security/session-security';

@Controller('assistant')
export class QaAssistantController {
 constructor(@Inject(QaAiAdapter)private readonly ai:QaAiAdapter,@Inject(QaQuotaAdapter)private readonly quota:QaQuotaAdapter,@Inject(QaConversationsAdapter)private readonly conversations:QaConversationsAdapter){}
 @Get('conversations') @Header('Cache-Control','no-store')
 async list(@Req()req:AuthenticatedRequest,@Query('offset')offset='0'){
  if(!/^\d{1,6}$/.test(offset))throw new BadRequestException('Página inválida.');
  return {data:await this.conversations.list(req.user!.id,Number(offset))};
 }
 @Get('conversations/:id') @Header('Cache-Control','no-store')
 async read(@Req()req:AuthenticatedRequest,@Param('id',ParseUUIDPipe)id:string){return {data:await this.conversations.get(req.user!.id,id)};}
 @Patch('conversations/:id') @Header('Cache-Control','no-store')
 async archive(@Req()req:AuthenticatedRequest,@Param('id',ParseUUIDPipe)id:string,@Body()body:unknown){
  if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).length!==1||!('archived' in body)||typeof body.archived!=='boolean')throw new BadRequestException('Indica si deseas archivar o restaurar la conversación.');
  return {data:await this.conversations.archive(req.user!.id,id,body.archived)};
 }
 @Post('chat') @Header('Cache-Control','no-store')
 async chat(@Body()body:unknown,@Req()req:AuthenticatedRequest){
  const input=qaChatSchema.safeParse(body);
  if(!input.success)throw new BadRequestException('Envía una pregunta de hasta 4000 caracteres y un historial válido.');
  const configuration=await this.ai.configuration();
  const question=input.data.messages.at(-1)!.content;
  const current=input.data.keepHistory&&input.data.conversationId?await this.conversations.prepare(req.user!.id,question,input.data.conversationId,input.data.revision):null;
  await this.quota.reserve(req.user!.id);
  const context=current?[...current.messages.slice(-4).map(m=>({...m,content:m.content.slice(0,3000)})),{role:'user' as const,content:question}]:input.data.keepHistory?[{role:'user' as const,content:question}]:input.data.messages;
  const result=await this.ai.answer({...input.data,messages:context},configuration);
  const answer=result.answer+(result.truncated?'\n\nRespuesta recortada. Puedes pedirme que continúe.':'');
  const saved=input.data.keepHistory?(current??await this.conversations.prepare(req.user!.id,question)):null;
  const conversation=saved?await this.conversations.append(req.user!.id,saved,question,answer):undefined;
  return {data:{...result,...(conversation?{conversation}:{})}};
 }
}
