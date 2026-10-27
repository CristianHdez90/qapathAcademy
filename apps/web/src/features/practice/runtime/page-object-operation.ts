import {runBrowserScenario,basicScenario,type ScenarioConfig} from './browser-scenario';
/** Real local page operation: actions return observations; the mission owns its assertions. */
export class TrainingQuotePage {
 constructor(private readonly frame:HTMLIFrameElement,private readonly controller:AbortController){}
 async open(){const deadline=Date.now()+8000;while(!this.frame.contentDocument?.querySelector('[aria-label="Cotizador QA Store"]')&&Date.now()<deadline){if(this.controller.signal.aborted)throw Error('Operación cancelada.');await new Promise(resolve=>setTimeout(resolve,50))}if(this.controller.signal.aborted||!this.frame.contentDocument?.querySelector('[aria-label="Cotizador QA Store"]'))throw Error('El cotizador no está listo. Espera la carga y vuelve a intentar.')}
 async quote(data:Omit<ScenarioConfig,'expected'>){
  await this.open();const win=this.frame.contentWindow;if(!win)throw Error('La vista no está disponible.');const original=win.fetch,observed:{status?:number}={};
  const recorder:typeof fetch=async(input,init)=>{const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;if(new URL(url,win.location.href).pathname!=='/api/v1/practice/quotes')return original.call(win,input,init);const response=await original.call(win,input,{...init,signal:this.controller.signal});observed.status=response.status;return response};
  const timer=setTimeout(()=>this.controller.abort(),12000);win.fetch=recorder;
  try{
   // The helper operates native controls. Its comparison is ignored here: assertions belong to the caller.
   await runBrowserScenario(this.frame,{...basicScenario,...data,expected:'__observation_only__'});
   const scope=this.frame.contentDocument?.querySelector('[aria-label="Cotizador QA Store"]'),total=scope?.querySelector('[data-testid="quote-total"]')?.textContent?.trim(),error=scope?.querySelector('[role="alert"]')?.textContent?.trim();
   if(!observed.status||(!total&&!error))throw Error('No se observó una respuesta HTTP y un resultado visible. Revisa la conexión y vuelve a intentar.');
   return {status:observed.status,kind:total?'total' as const:'error' as const,obtained:(total||error||'').slice(0,300),at:new Date().toISOString()};
  }finally{clearTimeout(timer);if(win.fetch===recorder)win.fetch=original;this.controller.abort()}
 }
}
