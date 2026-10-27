import {runBrowserScenario,basicScenario} from './browser-scenario';
import {simulatedHttpError,simulatedTransportError,type RecoveryMode,type RecoveryRecord} from '../recovery-practice';
export async function executeRecovery(frame:HTMLIFrameElement,view:string,mode:RecoveryMode,body:string,quantity:'1'|'2',controller:AbortController):Promise<RecoveryRecord>{
 if(mode==='contract'){try{JSON.parse(body)}catch{throw Error('Escribe un cuerpo JSON válido para simular el contrato.')}}
 const win=frame.contentWindow,doc=frame.contentDocument;if(!win||!doc||new URL(win.location.href).pathname!=='/practice')throw Error('La vista de práctica no está disponible.');
 const original=win.fetch,priorError=doc.querySelector('[aria-label="Cotizador QA Store"] [role="alert"]')?.textContent?.trim()||'',holder:{status:number|null;body:string;intercepted:number;forwarded:number}={status:null,body:'',intercepted:0,forwarded:0};
 const recorder:typeof fetch=async(input,init)=>{const raw=typeof input==='string'?input:input instanceof URL?input.href:input.url,url=new URL(raw,win.location.href),method=String(init?.method||(typeof input==='object'&&'method' in input?input.method:'GET')).toUpperCase();if(url.origin!==win.location.origin||url.pathname!=='/api/v1/practice/quotes'||method!=='POST')return original.call(win,input,init);
  let response:Response;
  if(mode==='real'){holder.forwarded++;response=await original.call(win,input,{...init,signal:controller.signal})}
  else{holder.intercepted++;if(mode==='transport'){const TransportError=Reflect.get(win,'TypeError') as typeof TypeError;throw new TransportError(simulatedTransportError)}response=new Response(mode==='http'?JSON.stringify({sandbox:true,error:simulatedHttpError}):body,{status:mode==='http'?503:200,headers:{'Content-Type':'application/json'}})}
  holder.status=response.status;holder.body=(await response.clone().text()).slice(0,700);return response;
 };
 const timeout=setTimeout(()=>controller.abort(),12000);win.fetch=recorder;let result:RecoveryRecord|undefined;
 try{await runBrowserScenario(frame,{...basicScenario,quantity,expected:'__observe_only__',mock:false});const scope=doc.querySelector('[aria-label="Cotizador QA Store"]');result={mode,status:holder.status,body:holder.body,total:scope?.querySelector('[data-testid="quote-total"]')?.textContent?.trim()||'',error:(scope?.querySelector('[role="alert"]')?.textContent?.trim()||'').slice(0,160),at:new Date().toISOString(),view,quantity,intercepted:holder.intercepted,forwarded:holder.forwarded,restored:false,...(priorError?{priorError:priorError.slice(0,160)}:{})};
 }finally{clearTimeout(timeout);if(win.fetch===recorder)win.fetch=original;if(result)result.restored=win.fetch===original;controller.abort()}
 return result;
}
