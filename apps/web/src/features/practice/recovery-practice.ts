export type RecoveryMode='real'|'http'|'contract'|'transport';
export type RecoveryKey='baseline'|'http'|'contract'|'transport'|'recoveryError'|'recovery'|'regression';
export type RecoveryRecord={mode:RecoveryMode;status:number|null;body:string;total:string;error:string;at:string;view:string;quantity:'1'|'2';intercepted:number;forwarded:number;restored:boolean;priorError?:string};
export type RecoveryMission={recoveryVersion:1;page:number;scope:string;scopeAt?:string;mockBody:string;records:Partial<Record<RecoveryKey,RecoveryRecord>>};
export const simulatedHttpError='Servicio temporal simulado para entrenamiento.';
export const simulatedTransportError='Fallo de transporte simulado (entrenamiento).';
export const defaultRecoveryBody=JSON.stringify({sandbox:true,data:{subtotal:35000,total:35000}},null,2);
const date=(value:unknown):value is string=>typeof value==='string'&&Number.isFinite(Date.parse(value));
export function readRecovery(source?:string):RecoveryMission{const empty:RecoveryMission={recoveryVersion:1,page:0,scope:'',mockBody:defaultRecoveryBody,records:{}};try{const raw=JSON.parse(source||'{}');if(raw.recoveryVersion!==1)return empty;empty.page=Number.isInteger(raw.page)?Math.max(0,Math.min(4,raw.page)):0;empty.scope=raw.scope==='exact'?'exact':raw.scope==='all'?'all':'';if(date(raw.scopeAt))empty.scopeAt=raw.scopeAt;if(typeof raw.mockBody==='string')empty.mockBody=raw.mockBody.slice(0,500);for(const key of ['baseline','http','contract','transport','recoveryError','recovery','regression'] as const){const item=raw.records?.[key];if(item&&['real','http','contract','transport'].includes(item.mode)&&(item.status===null||Number.isInteger(item.status)&&item.status>=100&&item.status<=599)&&['body','total','error','view'].every(field=>typeof item[field]==='string')&&date(item.at)&&['1','2'].includes(item.quantity)&&Number.isInteger(item.intercepted)&&item.intercepted>=0&&Number.isInteger(item.forwarded)&&item.forwarded>=0&&typeof item.restored==='boolean')empty.records[key]={mode:item.mode,status:item.status,body:item.body.slice(0,700),total:item.total.slice(0,40),error:item.error.slice(0,160),at:item.at,view:item.view.slice(0,16),quantity:item.quantity,intercepted:item.intercepted,forwarded:item.forwarded,restored:item.restored,...(typeof item.priorError==='string'?{priorError:item.priorError.slice(0,160)}:{})}}return empty}catch{return empty}}
export const recoveryScoped=(book:RecoveryMission)=>book.scope==='exact'&&date(book.scopeAt);
function realQuote(item:RecoveryRecord|undefined,quantity:'1'|'2'){if(!item||item.mode!=='real'||item.status!==200||item.forwarded!==1||item.intercepted!==0||!item.restored||item.quantity!==quantity||item.total!==String(Number(quantity)*35000)+' COP'||item.error||!date(item.at))return false;try{const body=JSON.parse(item.body),data=body.data;return body.sandbox===true&&data?.productId==='basic'&&data.quantity===Number(quantity)&&data.subtotal===Number(quantity)*35000&&data.total===Number(quantity)*35000&&data.discount===0&&data.shipping===0&&data.currency==='COP'}catch{return false}}
function mockObserved(item:RecoveryRecord|undefined,mode:RecoveryMode){return !!item&&item.mode===mode&&item.intercepted===1&&item.forwarded===0&&item.restored&&!!item.view&&date(item.at)&&item.total===''}
export function recoveryPassed(book:RecoveryMission,key:RecoveryKey):boolean{const item=book.records[key];if(key==='baseline')return realQuote(item,'1');if(!item)return false;if(key==='http'||key==='recoveryError')return mockObserved(item,'http')&&item.status===503&&item.error==='HTTP 503: '+simulatedHttpError;if(key==='contract')return mockObserved(item,'contract')&&item.status===200&&item.body===book.mockBody&&item.error==='Contrato de cotización inválido.';if(key==='transport')return mockObserved(item,'transport')&&item.status===null&&item.body===''&&item.error===simulatedTransportError;if(key==='recovery')return realQuote(item,'1')&&recoveryPassed(book,'recoveryError')&&item.view===book.records.recoveryError?.view&&/^HTTP 503: .+/.test(item.priorError||'')&&Date.parse(item.at)>=Date.parse(book.records.recoveryError!.at);return realQuote(item,'2')&&recoveryPassed(book,'recovery')&&item.view===book.records.recovery?.view&&Date.parse(item.at)>=Date.parse(book.records.recovery!.at)}
export const recoveryComplete=(book:RecoveryMission)=>recoveryScoped(book)&&(['baseline','http','contract','transport','recoveryError','recovery','regression'] as const).every(key=>recoveryPassed(book,key));
export const recoverySteps=[
 {title:'Delimita y comprueba',goal:'El mock debe afectar únicamente POST de quotes. Comprueba primero que el sandbox real responde sin simulación.',actions:['Elige una intercepción por ruta exacta y método POST.','Ejecuta la cotización real de una unidad, sin cupón y con recogida.','Conserva HTTP, contrato y total observado: 35000 COP.'],hint:'Un patrón que capture todas las solicitudes también puede bloquear catálogo, archivos o autenticación. El laboratorio limita cada simulación a la petición de cotización del iframe.',snippet:"const matches = (url: URL) => url.pathname === '/api/v1/practice/quotes';\n// Dentro del handler, procesa solo POST y deja continuar otros métodos."},
 {title:'Simula un error HTTP',goal:'Una respuesta HTTP 503 existe y llega a la UI. La interfaz debe informar el error y ocultar el total de éxito.',actions:['Ejecuta la respuesta 503 controlada.','Revisa que exista status 503 y una alerta visible.','Comprueba que el total no aparezca y la intercepción se retire al terminar.'],hint:'Un mock 503 verde comprueba cómo reacciona la UI; no demuestra que el backend real esté disponible o caído.',snippet:"await route.fulfill({status:503,contentType:'application/json',\n body:JSON.stringify({sandbox:true,error:'Servicio temporal simulado para entrenamiento.'})});"},
 {title:'Desafía el contrato',goal:'Una respuesta 200 también puede ser inválida. Observa qué hace la UI cuando faltan campos de cotización.',actions:['Revisa el JSON simulado: faltan discount y shipping.','Ejecuta y comprueba la alerta de contrato inválido, sin total.','Puedes probar un contrato válido; el objetivo de este paso quedará pendiente hasta volver al incompleto.'],hint:'La UI exige subtotal, discount, shipping y total numéricos. Cambiar solo el status a 200 no completa el contrato.',snippet:'// Cuerpo incompleto de entrenamiento:\n{ "sandbox": true, "data": { "subtotal": 35000, "total": 35000 } }'},
 {title:'Distingue transporte',goal:'Un fallo de transporte no devuelve HTTP 503: la petición no obtiene una respuesta HTTP.',actions:['Ejecuta el corte de transporte controlado.','Comprueba la alerta y la ausencia de total.','Compara el status sin respuesta con el 503 conservado en la bitácora.'],hint:'La plataforma rechaza únicamente el fetch de cotización del iframe. El spec externo usa route.abort. El texto de un fallo nativo puede variar entre navegadores.',snippet:"await route.abort('failed');\n// El test verifica alerta y ausencia de éxito, sin inventar un status HTTP."},
 {title:'Recupera y confirma',goal:'Comprueba que la misma vista sale del estado de error y vuelve a responder al backend real.',actions:['Prepara un 503 en la vista actual. La simulación se retira al finalizar, aunque la alerta sigue visible.','Ejecuta la recuperación real: debe limpiar la alerta y mostrar 35000 COP.','Ejecuta otra cotización de dos unidades: 70000 COP confirma que no quedó una respuesta fija.'],hint:'Después de recargar la página debes volver a preparar el error en la vista actual. Las capturas guardadas se conservan, pero el estado DOM anterior ya no está en esa ventana.',snippet:"await page.unroute(matches, handler);\n// Reintento real en la misma Page.\nawait expect(total).toHaveText('35000 COP');"}
];
export const recoveryLabels:Record<RecoveryKey,string>={baseline:'Base real',http:'HTTP 503 simulado',contract:'Contrato incompleto simulado',transport:'Transporte simulado',recoveryError:'Error previo al retest',recovery:'Recuperación real',regression:'Segunda cotización real'};
export const recoveryReflections=[{title:'¿Qué interceptaste y qué dejaste pasar?',hint:'Identifica ruta, método y alcance del mock. Explica por qué el catálogo y otras rutas no deben quedar interceptados.'},{title:'¿Qué distingue los tres fallos?',hint:'Compara status, cuerpo, alerta y ausencia de total en el 503, el contrato 200 incompleto y el transporte sin respuesta.'},{title:'¿Qué evidencia respalda la recuperación?',hint:'Relaciona el 503 previo, la limpieza de la alerta, 35000 COP y la segunda cotización de 70000 COP. Distingue captura integrada, simulación y reporte externo.'}];
export function recoveryEvidence(source:string|undefined,output:string,values:string[],labels:string[]){const book=readRecovery(source);return ['# Semana 20 · Mocks y recuperación','Simulaciones locales del iframe y llamadas reales al sandbox. Un mock aprobado no demuestra disponibilidad del backend. El reporte de Playwright queda pendiente hasta ejecutarlo.',...(['baseline','http','contract','transport','recoveryError','recovery','regression'] as const).flatMap(key=>{const item=book.records[key];return ['## '+recoveryLabels[key],...(item?[`Origen: ${item.mode==='real'?'red del sandbox':'simulación local '+item.mode}\nFecha: ${item.at}\nVista: ${item.view}\nHTTP: ${item.status===null?'sin respuesta':item.status}\nTotal DOM: ${item.total||'ausente'}\nAlerta DOM: ${item.error||'ausente'}\nIntercepciones: ${item.intercepted}; llamadas reales de cotización: ${item.forwarded}\nIntercepción retirada: ${item.restored?'sí':'no'}\nObjetivo: ${recoveryPassed(book,key)?'comprobado':'pendiente'}`,item.priorError?'Alerta previa: '+item.priorError:'', 'Cuerpo observado: '+(item.body||'(sin cuerpo HTTP)')]:['Sin ejecución registrada.'])]}),'## Cuerpo simulado de contrato',book.mockBody,'## Última salida',output,...labels.flatMap((label,i)=>['## '+label,values[i]?.trim()||'Reflexión opcional pendiente.'])].filter(Boolean).join('\n\n')}
export function recoveryFiles(book:RecoveryMission){const helpers=`const matches=(url:URL)=>url.pathname==='/api/v1/practice/quotes';
async function open(page:Page){
 await page.goto('/practice#qa-store-quote');
 const form=page.getByRole('region',{name:'Cotizador QA Store'});
 await form.getByLabel('Producto ficticio').locator('option[value="pro"]').waitFor({state:'attached'});
 return form;
}
async function submit(page:Page,quantity='1'){
 const form=page.getByRole('region',{name:'Cotizador QA Store'});
 await form.getByLabel('Producto ficticio').selectOption('basic');
 await form.getByLabel('Cantidad',{exact:true}).fill(quantity);
 await form.getByLabel('Cupón',{exact:true}).fill('');
 await form.getByLabel('Envío',{exact:true}).selectOption('pickup');
 await form.getByLabel('Activar defecto de cálculo (solo práctica)').uncheck();
 await form.getByRole('button',{name:'Cotizar',exact:true}).click();
 return form;
}
`,header="import {test,expect,type Page,type Route} from '@playwright/test';\n";return [
 {name:'tests/network-mocks.training.spec.ts',source:header+helpers+`
// Estos tests prueban reacciones de UI con mocks, no disponibilidad del backend.
for(const mode of ['http','contract','transport'] as const){
 test('mock acotado '+mode,async({page})=>{
  const form=await open(page);let received=false,mocked=0;
  page.on('response',response=>{if(matches(new URL(response.url()))&&response.request().method()==='POST')received=true;});
  const handler=async(route:Route)=>{
   if(route.request().method()!=='POST'){await route.fallback();return;}
   mocked++;if(mode==='transport'){await route.abort('failed');return;}
   await route.fulfill({status:mode==='http'?503:200,contentType:'application/json',body:mode==='http'?JSON.stringify({sandbox:true,error:${JSON.stringify(simulatedHttpError)}}):${JSON.stringify(book.mockBody)}});
  };
  await page.route(matches,handler);
  try{
   await submit(page);
   const alert=form.getByRole('alert');await expect(alert).toBeVisible();
   if(mode==='http')await expect(alert).toContainText('HTTP 503: '+${JSON.stringify(simulatedHttpError)});
   if(mode==='contract')await expect(alert).toHaveText('Contrato de cotización inválido.');
   expect(mocked).toBe(1);if(mode==='transport')expect(received).toBe(false);
   await expect(form.getByTestId('quote-total')).toHaveCount(0);
  }finally{await page.unroute(matches,handler);}
 });
}
`},
 {name:'tests/network-recovery.training.spec.ts',source:header+helpers+`
// Prueba mixta: primero error simulado, después recuperación real en la misma Page.
test('retira el mock y recupera el contrato real',async({page})=>{
 const form=await open(page);
 const handler=async(route:Route)=>{if(route.request().method()!=='POST'){await route.fallback();return;}await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({sandbox:true,error:${JSON.stringify(simulatedHttpError)}})});};
 await page.route(matches,handler);
 try{await submit(page);await expect(form.getByRole('alert')).toContainText('HTTP 503');await expect(form.getByTestId('quote-total')).toHaveCount(0);}
 finally{await page.unroute(matches,handler);}
 // Espera la respuesta real antes de verificar el DOM.
 const response=page.waitForResponse(value=>matches(new URL(value.url()))&&value.request().method()==='POST');
 await submit(page);expect((await response).status()).toBe(200);
 await expect(form.getByRole('alert')).toHaveCount(0);await expect(form.getByTestId('quote-total')).toHaveText('35000 COP');
 await submit(page,'2');await expect(form.getByTestId('quote-total')).toHaveText('70000 COP');
});
`},
 {name:'tests/network-integration.training.spec.ts',source:"import {test,expect,type Page} from '@playwright/test';\n"+helpers.replace("const matches=(url:URL)=>url.pathname==='/api/v1/practice/quotes';\n",'')+`
// Integración real: sin page.route ni respuestas simuladas.
for(const quantity of ['1','2'])test('integracion real cantidad '+quantity,async({page})=>{
 const form=await open(page);
 const response=page.waitForResponse(value=>new URL(value.url()).pathname==='/api/v1/practice/quotes'&&value.request().method()==='POST');
 await submit(page,quantity);const observed=await response;expect(observed.status()).toBe(200);
 const body=await observed.json();expect(body.sandbox).toBe(true);expect(body.data.quantity).toBe(Number(quantity));
 expect(body.data.total).toBe(Number(quantity)*35000);expect(typeof body.data.total).toBe('number');
 await expect(form.getByTestId('quote-total')).toHaveText(String(Number(quantity)*35000)+' COP');
 await expect(form.getByRole('alert')).toHaveCount(0);
});
`}
]}
