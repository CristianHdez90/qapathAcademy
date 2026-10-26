import {Injectable} from '@nestjs/common';
import {AiSettingsAdapter} from './ai-settings.adapter';
import {GeminiQaAdapter} from './gemini-qa.adapter';
import {GroqQaAdapter} from './groq-qa.adapter';
import type {QaChatInput} from '../../application/qa-assistant';
import type {AiRuntime} from '../../application/ai-settings';
@Injectable()
export class QaAiAdapter {
 constructor(private readonly settings:AiSettingsAdapter,private readonly gemini:GeminiQaAdapter,private readonly groq:GroqQaAdapter){}
 configuration(){return this.settings.runtime()}
 async answer(input:QaChatInput,config?:AiRuntime){const current=config||await this.configuration();return current.provider==='groq'?this.groq.answer(input,current):this.gemini.answer(input,current)}
 async test(){const config=await this.settings.runtime(false),start=Date.now(),result=await this.answer({messages:[{role:'user',content:'Explica en una frase qué es una prueba smoke en QA.'}]},config);return {...result,provider:config.provider,model:config.model,durationMs:Date.now()-start}}
}
