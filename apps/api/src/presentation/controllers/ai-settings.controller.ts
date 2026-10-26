import {BadRequestException,Body,Controller,Get,Header,Patch,Post,Req} from '@nestjs/common';
import {aiSettingsSchema} from '../../application/ai-settings';
import {AiSettingsAdapter} from '../../infrastructure/adapters/ai-settings.adapter';
import {QaAiAdapter} from '../../infrastructure/adapters/qa-ai.adapter';
import {QaQuotaAdapter} from '../../infrastructure/adapters/qa-quota.adapter';
import {Roles} from '../security/session-security';
import type {AuthenticatedRequest} from '../security/session-security';
@Controller('admin/ai-settings')
@Roles('ADMIN')
export class AiSettingsController {
 constructor(private readonly settings:AiSettingsAdapter,private readonly ai:QaAiAdapter,private readonly quota:QaQuotaAdapter){}
 @Get() @Header('Cache-Control','no-store') view(){return this.settings.view().then(data=>({data}))}
 @Patch() @Header('Cache-Control','no-store') async save(@Req()request:AuthenticatedRequest,@Body()body:unknown){const parsed=aiSettingsSchema.safeParse(body);if(!parsed.success)throw new BadRequestException('Configuración inválida: revisa proveedor, URL oficial, modelo, temperatura, tokens y clave.');return {data:await this.settings.save(parsed.data,request.user!.id)}}
 @Post('test') @Header('Cache-Control','no-store') async test(@Req()request:AuthenticatedRequest,@Body()body:unknown){if(body&&typeof body==='object'&&!Array.isArray(body)&&Object.keys(body).length===0){await this.quota.reserve(request.user!.id);return {data:await this.ai.test()}}throw new BadRequestException('La prueba utiliza la configuración guardada. Envía un objeto vacío.')}
}
