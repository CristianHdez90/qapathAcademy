import {basicScenario,type ScenarioConfig} from './runtime/browser-scenario';
import type {PracticeRun} from '@/components/academy/practice-execution';
export type TraceObservation={api:number;ui:number;status:number;expected:number;defect:boolean;at:string;payload?:string};
export type TraceMission={traceLabVersion:1;page:number;prepared:boolean;reproduction?:TraceObservation;diagnosis?:'presentation';retest?:TraceObservation;regression?:TraceObservation};
export const traceConfig:ScenarioConfig={...basicScenario,quantity:'3',coupon:'QA10',shipping:'delivery',expected:'104500 COP',defect:true};
export function traceReproduced(value?:TraceObservation){return !!value&&value.status===200&&value.defect&&value.expected===104500&&value.api===104500&&value.ui===103500}
export function traceRetested(value?:TraceObservation){return !!value&&value.status===200&&!value.defect&&value.expected===104500&&value.api===104500&&value.ui===104500}
export function traceRegressed(value?:TraceObservation){return !!value&&value.status===200&&!value.defect&&value.expected===35000&&value.api===35000&&value.ui===35000}
export function traceComplete(value:TraceMission){return traceReproduced(value.reproduction)&&value.diagnosis==='presentation'&&traceRetested(value.retest)&&traceRegressed(value.regression)}
export function readTraceMission(source?:string):TraceMission{
 const empty:TraceMission={traceLabVersion:1,page:0,prepared:false};
 try{const value=JSON.parse(source||'{}');if(value.traceLabVersion!==1)return empty;
  const read=(candidate:unknown):TraceObservation|undefined=>{if(!candidate||typeof candidate!=='object')return;const item=candidate as TraceObservation;return [item.api,item.ui,item.status,item.expected].every(Number.isFinite)&&typeof item.defect==='boolean'&&typeof item.at==='string'&&Number.isFinite(Date.parse(item.at))?{api:item.api,ui:item.ui,status:item.status,expected:item.expected,defect:item.defect,at:item.at,...(typeof item.payload==='string'&&item.payload.length<=400?{payload:item.payload}:{})}:undefined};
  return {...empty,page:Number.isInteger(value.page)&&value.page>=0&&value.page<=4?value.page:0,prepared:value.prepared===true,reproduction:read(value.reproduction),diagnosis:value.diagnosis==='presentation'?'presentation':undefined,retest:read(value.retest),regression:read(value.regression)};
 }catch{return empty}
}
export const traceSteps=[
 {title:'Prepara la captura',goal:'Conoce el esperado y decide dónde buscar la evidencia antes de reproducir.',steps:['La compra de entrenamiento es básico × 3 con QA10 y entrega.','Calcula 105000 − 10500 + 10000 = 104500 COP.','Abre Network antes de reproducir; el laboratorio no detecta si abriste DevTools.'],expected:'104500 COP · petición POST a /api/v1/practice/quotes',hintTitle:'Captura antes de ejecutar',hint:'En Network filtra Fetch/XHR por quotes. Payload muestra quantity, coupon y shipping. Response contiene el total del servicio. El trace externo permite revisar acciones y aserciones en una ejecución Playwright.',snippet:"POST /api/v1/practice/quotes\n{ productId: 'basic', quantity: 3, coupon: 'QA10', shipping: 'delivery' }"},
 {title:'Reproduce y conserva',goal:'Ejecuta el escenario defectuoso y guarda las dos evidencias: respuesta API y total visible.',steps:['Pulsa Reproducir y capturar: el defecto se activa en QA Store.','Compara la regla, la respuesta del servicio y la pantalla.','La reproducción solo se confirma si API=104500 y UI=103500.'],expected:'Fallo de comparación · API 104500 COP · UI 103500 COP',hintTitle:'Un HTTP 200 no demuestra que la UI esté bien',hint:'El servicio puede responder correctamente mientras la interfaz presenta otro importe. El laboratorio captura la respuesta de la petición y lee el total real del DOM; no sustituye un valor por otro.',snippet:"await expect(form.getByTestId('quote-total')).toHaveText('104500 COP');\n// Con el defecto activo se observa 103500 COP: la aserción debe fallar."},
 {title:'Ubica la causa',goal:'Elige una hipótesis que explique la diferencia, apoyándote en las observaciones conservadas.',steps:['Comprueba que la API coincide con el esperado de negocio.','Observa dónde aparece la diferencia de 1000 COP.','Valida la hipótesis antes de atribuir el defecto al servicio.'],expected:'Diagnóstico respaldado: presentación de la interfaz',hintTitle:'Separa el origen del dato de su presentación',hint:'Si Response devuelve 104500 y el DOM muestra 103500, el cambio aparece después de recibir la respuesta. El dato de Network no respalda culpar al cálculo del servicio.',snippet:'Esperado: 104500 COP\nAPI:      104500 COP\nUI:       103500 COP\nDiferencia API − UI: 1000 COP'},
 {title:'Ejecuta el retest',goal:'Desactiva el defecto y repite exactamente la misma compra y expectativa.',steps:['Desmarca Activar defecto de presentación.','Ejecuta el retest y vuelve a capturar API y DOM.','Ambos valores deben coincidir con 104500 COP; no cambies la aserción para ocultar el fallo.'],expected:'Retest correcto · API = UI = 104500 COP',hintTitle:'Corrige la causa, conserva la comprobación',hint:'Con el defecto activo el retest debe seguir pendiente. Desactivarlo prepara la corrección; solo la nueva ejecución comprueba su resultado.',snippet:"await form.getByLabel('Activar defecto de cálculo (solo práctica)').uncheck();\nawait expect(form.getByTestId('quote-total')).toHaveText('104500 COP');"},
 {title:'Regresión y trace',goal:'Comprueba otra cotización y prepara el spec para conservar un trace externo del fallo y del retest.',steps:['Ejecuta la regresión básica: una unidad sin cupón ni entrega debe costar 35000 COP.','Descarga el spec y revisa los comandos para ejecutar BUG-01 y TC-02 con --trace on.','Guarda la investigación; añade el comando y la ubicación del trace solo si lo ejecutaste en tu equipo.'],expected:'Regresión 35000 COP · investigación completa · trace externo pendiente hasta ejecutarlo',hintTitle:'Un trace es un archivo de una ejecución real',hint:'El spec incluye una reproducción BUG-01 que falla intencionalmente, un retest TC-02 y una regresión TC-01. Usa --trace on y abre el archivo del resultado correspondiente. La plataforma no fabrica un trace al descargar el spec.',snippet:'npx playwright test tests/debug-quote.spec.ts --grep BUG-01 --project=chromium --trace on\nnpx playwright test tests/debug-quote.spec.ts --grep TC-02 --project=chromium --trace on'}
];
export function traceSpec(){return `import {test, expect} from '@playwright/test';
// Usa el playwright.config.ts del kit y configura BASE_URL.
async function quote(page, defect, quantity, coupon, shipping, expected) {
  await page.goto('/practice#qa-store-quote');
  const form = page.getByRole('region', {name: 'Cotizador QA Store'});
  // Given: mismos datos de entrenamiento, sin cuentas reales.
  await form.getByLabel('Producto ficticio').selectOption('basic');
  await form.getByLabel('Cantidad', {exact: true}).fill(quantity);
  await form.getByLabel('Cupón', {exact: true}).fill(coupon);
  await form.getByLabel('Envío', {exact: true}).selectOption(shipping);
  await form.getByLabel('Activar defecto de cálculo (solo práctica)').setChecked(defect);
  // Registra la espera antes de hacer clic, sin sleeps fijos.
  const responsePromise = page.waitForResponse(response =>
    new URL(response.url()).pathname === '/api/v1/practice/quotes'
    && response.request().method() === 'POST');
  await form.getByRole('button', {name: 'Cotizar', exact: true}).click();
  const response = await responsePromise;
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.data.total).toBe(Number(expected.split(' ')[0]));
  // Then: compara la UI con el esperado, aunque la API sea correcta.
  await expect(form.getByTestId('quote-total')).toHaveText(expected);
}
test('BUG-01 reproduccion con defecto intencional', async ({page}) => {
  // Debe FALLAR: API 104500, interfaz 103500. Conserva esa evidencia.
  await quote(page, true, '3', 'QA10', 'delivery', '104500 COP');
});
test('TC-02 retest con correccion', async ({page}) => {
  await quote(page, false, '3', 'QA10', 'delivery', '104500 COP');
});
test('TC-01 regresion basica', async ({page}) => {
  await quote(page, false, '1', '', 'pickup', '35000 COP');
});
`}
export const traceReflections=[
 {title:'¿Cómo reproduciste el fallo?',help:'Relaciona TC-02 y BUG-01 como referencias de entrenamiento. Indica datos, esperado y ambos valores observados.',hint:'Básico × 3, QA10, entrega: esperado 104500. Conserva el valor de API y el de UI por separado. No conviertas un error de conexión en una reproducción del defecto.',placeholder:'Con los datos… esperaba… API respondió… La interfaz mostró…'},
 {title:'¿Qué evidencia respaldó la causa?',help:'Explica qué observaste en la respuesta y en la pantalla, y qué hipótesis descartaste.',hint:'Si la API coincide con el esperado y el DOM no, la diferencia aparece en la presentación. Si abriste un trace externo, identifica la acción, la respuesta y la aserción observadas.',placeholder:'La respuesta… El DOM… Esto respalda… Descarté…'},
 {title:'¿Qué comprobaste después de corregir?',help:'Compara retest y regresión. Añade comando, navegador y ubicación del trace externo solo si realmente lo generaste.',hint:'Retest repite la compra con el defecto desactivado. Regresión comprueba básico × 1. Descargar el spec no ejecuta Playwright ni genera trace.zip.',placeholder:'Retest… Regresión… Comando y trace externo, si lo ejecuté… Límites…'}
];
export function traceEvidence(run:PracticeRun|undefined,values:string[],labels:string[]){const mission=readTraceMission(run?.source);return ['# Semana 15 · Investigación con API, DOM y trace','Referencias de entrenamiento: TC-02 y BUG-01. Peticiones y DOM observados en QA Store. El defecto de presentación es intencional. El spec descargado no demuestra una ejecución externa ni genera un trace por sí solo.',...([['Reproducción',mission.reproduction],['Retest',mission.retest],['Regresión',mission.regression]] as const).flatMap(([title,item])=>item?['## '+title,'Fecha: '+item.at,'HTTP: '+item.status,...(item.payload?['Payload capturado: '+item.payload]:[]),'Esperado: '+item.expected+' COP','API: '+item.api+' COP','UI: '+item.ui+' COP','Defecto activo: '+(item.defect?'sí':'no')]:['## '+title,'Sin ejecución registrada.']), 'Diagnóstico: '+(mission.diagnosis==='presentation'?'presentación de la interfaz':'por comprobar'),...(run?['## Última salida integrada','```text',run.output,'```']:[]),...labels.flatMap((label,i)=>['## '+label,values[i]?.trim()||'Reflexión opcional pendiente.']),'## Spec generado para repetir con Playwright','```typescript',traceSpec(),'```'].join('\n\n')}
