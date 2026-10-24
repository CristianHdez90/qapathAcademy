import {BadRequestException,Body,Controller,Header,Inject,Post,Req} from '@nestjs/common';
import {qaChatSchema} from '../../application/qa-assistant';
import {GeminiQaAdapter} from '../../infrastructure/adapters/gemini-qa.adapter';
import {QaQuotaAdapter} from '../../infrastructure/adapters/qa-quota.adapter';
import type {AuthenticatedRequest} from '../security/session-security';

@Controller('assistant')
export class QaAssistantController {
 constructor(@Inject(GeminiQaAdapter)private readonly ai:GeminiQaAdapter,@Inject(QaQuotaAdapter)private readonly quota:QaQuotaAdapter){}
 @Post('chat') @Header('Cache-Control','no-store')
 async chat(@Body()body:unknown,@Req()req:AuthenticatedRequest){
  const input=qaChatSchema.safeParse(body);
  if(!input.success)throw new BadRequestException('Envía una pregunta de hasta 4000 caracteres y un historial válido.');
  this.ai.configuration();
  await this.quota.reserve(req.user!.id);
  return {data:await this.ai.answer(input.data)};
 }
}
