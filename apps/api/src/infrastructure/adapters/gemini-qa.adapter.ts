import {Injectable,ServiceUnavailableException,HttpException} from '@nestjs/common';
import {QA_SYSTEM_PROMPT} from '../../application/qa-assistant';
import type {QaChatInput} from '../../application/qa-assistant';

@Injectable()
export class GeminiQaAdapter {
 configuration(){
  const key=process.env.GEMINI_API_KEY?.trim();
  const model=process.env.QA_AI_MODEL?.trim()||'gemini-2.5-flash';
  if(process.env.QA_AI_ENABLED!=='true'||!key)throw new ServiceUnavailableException('Lía QA todavía no está configurada. El administrador debe activar el servicio de IA.');
  if(!/^[a-zA-Z0-9.-]+$/.test(model))throw new ServiceUnavailableException('El modelo de Lía QA no es válido.');
  return {key,model};
 }
 async answer(input:QaChatInput){
  const {key,model}=this.configuration();
  let response:Response;
  try{
   response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{
    method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},signal:AbortSignal.timeout(25000),
    body:JSON.stringify({systemInstruction:{parts:[{text:QA_SYSTEM_PROMPT}]},
     contents:input.messages.map((m,i)=>({role:m.role==='assistant'?'model':'user',parts:[{text:i===input.messages.length-1&&input.page?`Página actual de la academia: ${input.page}\n\n${m.content}`:m.content}]})),
     generationConfig:{temperature:0.4,maxOutputTokens:1600,thinkingConfig:{thinkingBudget:0}},
    }),
   });
  }catch{throw new ServiceUnavailableException('La IA está tardando demasiado o no está disponible. Inténtalo de nuevo.');}
  // No provider payloads or prompts in logs/errors: they can contain private data.
  if(response.status===429)throw new HttpException('La cuota de IA está agotada temporalmente. Inténtalo más tarde.',429);
  if(!response.ok)throw new ServiceUnavailableException('No se pudo consultar la IA. El administrador debe revisar la clave, el modelo y la cuota de Gemini.');
  const data=await response.json() as {candidates?:{content?:{parts?:{text?:string;thought?:boolean}[]};finishReason?:string}[]};
  const candidate=data.candidates?.[0];
  const text=candidate?.content?.parts?.filter(p=>!p.thought).map(p=>p.text||'').join('').trim();
  if(!text||!['STOP','MAX_TOKENS'].includes(candidate?.finishReason||''))throw new ServiceUnavailableException('No se pudo generar una respuesta. Reformula tu pregunta sobre QA.');
  return {answer:text.slice(0,12000),truncated:candidate?.finishReason==='MAX_TOKENS'};
 }
}
