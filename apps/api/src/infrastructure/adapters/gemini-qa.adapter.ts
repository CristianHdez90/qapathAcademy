import {Injectable,ServiceUnavailableException,HttpException} from '@nestjs/common';
import {QA_SYSTEM_PROMPT} from '../../application/qa-assistant';
import type {QaChatInput} from '../../application/qa-assistant';

const providerReasons=new Set(['API_KEY_INVALID','API_KEY_EXPIRED','API_KEY_SERVICE_BLOCKED','API_KEY_HTTP_REFERRER_BLOCKED',
 'API_KEY_IP_ADDRESS_BLOCKED','SERVICE_DISABLED','CONSUMER_INVALID','BILLING_DISABLED','ACCESS_TOKEN_SCOPE_INSUFFICIENT']);
const providerStatuses=new Set(['INVALID_ARGUMENT','UNAUTHENTICATED','PERMISSION_DENIED','NOT_FOUND','RESOURCE_EXHAUSTED','FAILED_PRECONDITION','INTERNAL','UNAVAILABLE']);
type ProviderFailure={error?:{status?:string;message?:string;details?:{reason?:string}[]}};
function diagnostic(data:ProviderFailure,status:number){
 const error=data?.error;
 const reason=error?.details?.find(d=>d.reason&&providerReasons.has(d.reason))?.reason;
 if(reason)return reason;
 // Classify known messages locally; never copy provider messages into logs or responses.
 const message=typeof error?.message==='string'?error.message:'';
 if(/API key (?:not valid|is invalid)/i.test(message))return 'API_KEY_INVALID';
 if(/(?:reported as leaked|key.*(?:leaked|blocked))/i.test(message))return 'API_KEY_BLOCKED';
 if(/(?:location is not supported|not available in your country)/i.test(message))return 'REGION_UNSUPPORTED';
 if(/(?:thinkingBudget|thinking_budget|thinkingConfig|thinking_config)/i.test(message)&&status===400)return 'GENERATION_CONFIG_UNSUPPORTED';
 return error?.status&&providerStatuses.has(error.status)?error.status:`HTTP_${status}`;
}
const diagnosticMessages:Record<string,string>={
 API_KEY_INVALID:'Crea una clave de Gemini API en Google AI Studio y actualiza GEMINI_API_KEY en el proyecto API de Vercel. No uses la clave de Firebase.',
 API_KEY_EXPIRED:'La clave de Gemini venció. Sustitúyela en GEMINI_API_KEY y vuelve a desplegar la API.',
 API_KEY_BLOCKED:'Google bloqueó la clave. Revisa su estado en Google AI Studio y reemplázala si corresponde.',
 API_KEY_SERVICE_BLOCKED:'La clave debe permitir Generative Language API (generativelanguage.googleapis.com). Revisa sus restricciones de API.',
 API_KEY_HTTP_REFERRER_BLOCKED:'La clave tiene restricciones de sitios web incompatibles con las llamadas del backend. Usa una clave de servidor para Gemini.',
 API_KEY_IP_ADDRESS_BLOCKED:'Las restricciones de IP de la clave bloquean al servidor de Vercel.',
 SERVICE_DISABLED:'Habilita Generative Language API en el proyecto de la clave Gemini.',
 NOT_FOUND:'El modelo no está disponible para esta API o proyecto. Revisa QA_AI_MODEL y los modelos disponibles en Google AI Studio.',
 GENERATION_CONFIG_UNSUPPORTED:'El modelo configurado no admite los parámetros de generación actuales. Usa gemini-2.5-flash o revisa la integración del modelo elegido.',
 REGION_UNSUPPORTED:'Gemini API no está disponible para la ubicación de esta solicitud. Revisa la disponibilidad regional de Google.',
 BILLING_DISABLED:'Google exige facturación para esta configuración. Mantén el proyecto gratuito y elige un modelo con cuota gratuita disponible.',
 PERMISSION_DENIED:'Google rechazó los permisos. Revisa el estado de la clave, sus restricciones y el acceso del proyecto a Gemini API.',
 UNAUTHENTICATED:'Google no aceptó la autenticación. Revisa GEMINI_API_KEY en el proyecto API de Vercel.',
 INVALID_ARGUMENT:'Gemini rechazó los parámetros de la solicitud. Revisa el modelo configurado y los logs de diagnóstico.',
 FAILED_PRECONDITION:'El proyecto no cumple las condiciones para usar este modelo. Revisa la disponibilidad y cuota gratuita en Google AI Studio.',
};

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
  if(!response.ok){
   let failure:ProviderFailure={};
   try{failure=await response.json() as ProviderFailure}catch{/* Non-JSON errors have an HTTP-only diagnostic. */}
   const code=diagnostic(failure,response.status);
   console.warn(`QaAI operation=generateContent status=${response.status} code=${code}`);
   if(response.status===429||code==='RESOURCE_EXHAUSTED')throw new HttpException('La cuota de IA está agotada temporalmente [RESOURCE_EXHAUSTED]. Revisa la cuota gratuita de tu proyecto en Google AI Studio.',429);
   const message=diagnosticMessages[code]||(response.status>=500?'Gemini no está disponible temporalmente. Inténtalo más tarde.':'Google rechazó la consulta. Revisa el código de diagnóstico en los logs del proyecto API.');
   throw new ServiceUnavailableException(`Lía QA [${code}]: ${message}`);
  }
  let data:{candidates?:{content?:{parts?:{text?:string;thought?:boolean}[]};finishReason?:string}[]};
  try{data=await response.json() as typeof data}catch{throw new ServiceUnavailableException('Gemini devolvió una respuesta no válida. Inténtalo de nuevo.');}
  const candidate=data.candidates?.[0];
  const text=candidate?.content?.parts?.filter(p=>!p.thought).map(p=>p.text||'').join('').trim();
  if(!text||!['STOP','MAX_TOKENS'].includes(candidate?.finishReason||''))throw new ServiceUnavailableException('No se pudo generar una respuesta. Reformula tu pregunta sobre QA.');
  return {answer:text.slice(0,12000),truncated:candidate?.finishReason==='MAX_TOKENS'};
 }
}
