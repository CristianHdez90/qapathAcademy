export type ScenarioConfig={product:string;quantity:string;coupon:string;shipping:string;expected:string;defect:boolean;mock:boolean};
export const basicScenario:ScenarioConfig={product:'basic',quantity:'1',coupon:'',shipping:'pickup',expected:'35000 COP',defect:false,mock:false};
const delay=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));
export async function runBrowserScenario(frame:HTMLIFrameElement,config:ScenarioConfig){
 const win=frame.contentWindow,doc=frame.contentDocument;
 if(!win||!doc||new URL(win.location.href).pathname!=='/practice')throw new Error('Espera a que cargue la vista de práctica.');
 const scope=doc.querySelector('[aria-label="Cotizador QA Store"]');if(!scope)throw new Error('El cotizador todavía no está disponible.');
 const controls=()=>Array.from(scope.querySelectorAll<HTMLInputElement|HTMLSelectElement>('input,select'));
 const set=async(label:string,value:string)=>{
  const control=controls().find(el=>(el.getAttribute('aria-label')||el.closest('label')?.textContent||'').startsWith(label));
  if(!control)throw new Error('Control no encontrado: '+label);
  const setter=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(control),'value')?.set;
  setter?.call(control,value);control.dispatchEvent(new Event('input',{bubbles:true}));control.dispatchEvent(new Event('change',{bubbles:true}));await delay(50);
 };
 await set('Producto ficticio',config.product);await set('Cantidad',config.quantity);await set('Cupón',config.coupon);await set('Envío',config.shipping);
 const toggle=controls().find(el=>el instanceof HTMLInputElement&&el.type==='checkbox') as HTMLInputElement|undefined;
 // Cross-frame instanceof is unreliable: use tag/type attributes instead.
 const checkbox=toggle||controls().find(el=>el.tagName==='INPUT'&&(el as HTMLInputElement).type==='checkbox') as HTMLInputElement|undefined;
 if(checkbox&&checkbox.checked!==config.defect){checkbox.click();await delay(50)}
 const original=win.fetch;
 if(config.mock)win.fetch=async(input,init)=>String(input).includes('/api/v1/practice/quotes')?new Response(JSON.stringify({sandbox:true,error:'Servicio de práctica temporalmente no disponible'}),{status:503,headers:{'Content-Type':'application/json'}}):original.call(win,input,init);
 try{
  const button=Array.from(scope.querySelectorAll('button')).find(b=>b.textContent==='Cotizar');if(!button)throw new Error('Botón Cotizar no encontrado.');button.click();
  const end=Date.now()+10000;
  while(Date.now()<end){await delay(100);const total=scope.querySelector('[data-testid="quote-total"]')?.textContent;const error=scope.querySelector('[role="alert"]')?.textContent;if(total||error){const obtained=total||error||'';return {ok:obtained===config.expected||(!total&&obtained.includes(config.expected)),output:`Given ${config.product} × ${config.quantity}, cupón ${config.coupon||'vacío'}, ${config.shipping}\nWhen solicito cotizar\nThen espero: ${config.expected}\nResultado obtenido: ${obtained}\n${config.mock?'Respuesta 503 simulada en esta vista.':'Petición ejecutada contra QA Store.'}`}}}
  throw new Error('El cotizador no respondió dentro de 10 segundos.');
 }finally{win.fetch=original}
}
export function scenarioSpec(config:ScenarioConfig){
 return `import {test,expect} from '@playwright/test';\ntest('cotización configurada',async({page})=>{\n await page.goto('/practice');\n await page.getByLabel('Producto ficticio').selectOption(${JSON.stringify(config.product)});\n await page.getByLabel('Cantidad',{exact:true}).fill(${JSON.stringify(config.quantity)});\n await page.getByLabel('Cupón',{exact:true}).fill(${JSON.stringify(config.coupon)});\n await page.getByLabel('Envío',{exact:true}).selectOption(${JSON.stringify(config.shipping)});\n${config.defect?" await page.getByLabel('Activar defecto de cálculo (solo práctica)').check();\n":''}${config.mock?" await page.route('**/api/v1/practice/quotes',r=>r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({sandbox:true,error:'Servicio de práctica temporalmente no disponible'})}));\n":''} await page.getByRole('button',{name:'Cotizar',exact:true}).click();\n await expect(${/^\d+ COP$/.test(config.expected)?"page.getByTestId('quote-total')":"page.getByRole('region',{name:'Cotizador QA Store'}).getByRole('alert')"}).${/^\d+ COP$/.test(config.expected)?'toHaveText':'toContainText'}(${JSON.stringify(config.expected)});\n});`;
}
