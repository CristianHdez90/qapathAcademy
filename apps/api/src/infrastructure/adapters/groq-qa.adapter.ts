import {Injectable,HttpException,ServiceUnavailableException} from '@nestjs/common';
import {QA_SYSTEM_PROMPT} from '../../application/qa-assistant';
import type {QaChatInput} from '../../application/qa-assistant';
import type {AiRuntime} from '../../application/ai-settings';
@Injectable()
export class GroqQaAdapter {
 async answer(input:QaChatInput,config:AiRuntime){
  let response:Response;
  try{response=await fetch(config.baseUrl+'/responses',{method:'POST',redirect:'error',signal:AbortSignal.timeout(25000),headers:{Authorization:'Bearer '+config.key,'Content-Type':'application/json'},body:JSON.stringify({
   model:config.model,instructions:QA_SYSTEM_PROMPT,
   input:input.messages.map((message,index)=>({role:message.role,content:index===input.messages.length-1&&input.page?'Página actual de la academia: '+input.page+'\n\n'+message.content:message.content})),
   temperature:config.temperature,max_output_tokens:config.maxOutputTokens,
   ...(/^openai\/gpt-oss-(20b|120b)$/.test(config.model)?{reasoning:{effort:'low'}}:{})
  })})}catch{throw new ServiceUnavailableException('Groq está tardando demasiado o no está disponible. Inténtalo de nuevo.')}
  if(!response.ok){if(response.status===429)throw new HttpException('Groq alcanzó su límite temporal de consultas. Revisa la cuota e inténtalo más tarde.',429);const messages:Record<number,string>={400:'Groq rechazó el modelo o los parámetros de generación.',401:'Groq no aceptó la clave. Reemplázala desde Administración.',403:'La clave no tiene acceso al modelo configurado en Groq.',404:'El modelo o la ruta no está disponible en Groq.'};throw new ServiceUnavailableException(messages[response.status]||'Groq no está disponible temporalmente. Inténtalo más tarde.')}
  let data:{status?:string;incomplete_details?:{reason?:string};output?:{type?:string;role?:string;content?:{type?:string;text?:string}[]}[]};
  try{data=await response.json()}catch{throw new ServiceUnavailableException('Groq devolvió una respuesta no válida.')}
  const truncated=data.status==='incomplete'&&data.incomplete_details?.reason==='max_output_tokens';
  const text=data.output?.filter(item=>item.type==='message'&&item.role==='assistant').flatMap(item=>item.content||[]).filter(item=>item.type==='output_text'&&typeof item.text==='string').map(item=>item.text).join('').trim();
  if(!text||!(data.status==='completed'||truncated))throw new ServiceUnavailableException('No se pudo generar una respuesta de Groq. Revisa el límite de tokens o reformula tu pregunta.');
  return {answer:text.slice(0,12000),truncated:truncated||text.length>12000};
 }
}
