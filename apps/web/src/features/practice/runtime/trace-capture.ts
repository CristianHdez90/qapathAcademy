import {runBrowserScenario,type ScenarioConfig} from './browser-scenario';
import type {TraceObservation} from '../trace-practice';
/** Capture the actual response while the existing UI runner operates QA Store. */
export async function captureTraceQuote(frame:HTMLIFrameElement,config:ScenarioConfig,controller=new AbortController()){
 const deadline=Date.now()+8000;while(!frame.contentDocument?.querySelector('[aria-label="Cotizador QA Store"]')&&Date.now()<deadline)await new Promise(resolve=>setTimeout(resolve,50));
 const win=frame.contentWindow;if(!win||!frame.contentDocument)throw Error('La vista de QA Store no está lista.');
 const original=win.fetch,holder:{value?:{status:number;api:number;payload:string}}={};
 const recorder:typeof fetch=async(input,init)=>{
  const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
  if(new URL(url,win.location.href).pathname!=='/api/v1/practice/quotes')return original.call(win,input,init);
  const response=await original.call(win,input,{...init,signal:controller.signal});
  let api=NaN;try{const body=await response.clone().json();api=body.data?.total}catch{/* An invalid response cannot verify the investigation. */}
  holder.value={status:response.status,api,payload:typeof init?.body==='string'?init.body:''};return response;
 };
 const timeout=setTimeout(()=>controller.abort(),12000);win.fetch=recorder;
 try{const result=await runBrowserScenario(frame,config),captured=holder.value;
  if(!captured||captured.status!==200||!Number.isFinite(captured.api))throw Error('No se capturó una cotización válida. '+(captured?'HTTP '+captured.status+'. ':'')+'Revisa la conexión y vuelve a ejecutar.\n'+result.output);
  const total=frame.contentDocument.querySelector('[aria-label="Cotizador QA Store"] [data-testid="quote-total"]')?.textContent?.trim()||'';
  if(!/^\d+ COP$/.test(total))throw Error('No se obtuvo un total visible de la interfaz. No se validó la captura.');
  const observation:TraceObservation={api:captured.api,ui:Number(total.split(' ')[0]),status:captured.status,expected:Number(config.expected.split(' ')[0]),defect:config.defect,at:new Date().toISOString(),payload:captured.payload};
  return {observation,output:`POST /api/v1/practice/quotes\nPayload observado: ${captured.payload}\nHTTP ${captured.status}\nEsperado: ${observation.expected} COP\nAPI capturada: ${observation.api} COP\nUI observada en DOM: ${observation.ui} COP\nComparación UI: ${result.ok?'correcta':'fallida'}`};
 }finally{clearTimeout(timeout);if(win.fetch===recorder)win.fetch=original;controller.abort()}
}
