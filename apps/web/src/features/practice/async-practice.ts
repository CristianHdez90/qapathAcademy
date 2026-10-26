import type {PracticeRun} from '@/components/academy/practice-execution';

const client=`// Cliente con fetch inyectable. Los ejemplos no acceden a la red.
class HttpError extends Error {
  constructor(status) { super('HTTP ' + status); this.name = 'HttpError'; this.status = status; }
}
class TimeoutError extends Error {
  constructor() { super('Tiempo de espera agotado'); this.name = 'TimeoutError'; }
}
// Instrumentación de pruebas: permite comprobar que finally libera el timer.
const resources = { activeTimers: 0, cleared: 0, aborted: 0 };
async function readQuote(fetcher, timeoutMs = 80) {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  resources.activeTimers++;
  try {
    const response = await fetcher('/quotes-demo', { signal: controller.signal });
    // Un status HTTP de error NO es un rechazo de red.
    if (!response.ok) throw new HttpError(response.status);
    return await response.json();
  } catch (error) {
    if (timedOut && error.name === 'AbortError') throw new TimeoutError();
    throw error;
  } finally {
    clearTimeout(timer);
    resources.activeTimers--;
    resources.cleared++;
  }
}

// Doble determinista: resuelve, rechaza o espera a la cancelación real.
function mockFetch(mode = 'http', status = 200) {
  return async (_url, { signal }) => {
    if (mode === 'network') throw new TypeError('Fallo de red de entrenamiento');
    if (mode === 'pending') return new Promise((_resolve, reject) => {
      const abort = () => { resources.aborted++; reject(new DOMException('Cancelada', 'AbortError')); };
      if (signal.aborted) abort();
      else signal.addEventListener('abort', abort, { once: true });
    });
    return { ok: status >= 200 && status < 300, status,
      json: async () => ({ total: 35000, currency: 'COP' }) };
  };
}
`;
const rejection=`// Captura el error esperado; no ocultes una promesa que sí resolvió.
async function rejected(action) {
  try { await action(); } catch (error) { return error; }
  throw new Error('La operación debía rechazar');
}
`;
export const asyncChallenges=[
 {id:'success',title:'Espera una respuesta',goal:'Usa await para obtener una cotización y comprueba tanto los datos como la limpieza del temporizador.',steps:['Identifica dónde se espera la respuesta y dónde se espera el JSON.','Ejecuta las aserciones: el total esperado es 35.000 COP.','Revisa finally: el timer debe quedar liberado incluso cuando cambie el resultado.'],expected:'Respuesta 200 · total 35.000 COP · cero timers activos',hintTitle:'Una promesa necesita esperar su resultado',hint:'await fetcher obtiene la respuesta; await response.json() obtiene el cuerpo. La aserción compara un valor real. finally se ejecuta tanto en éxito como en error.',snippet:"const data = await readQuote(mockFetch());\nassert(data.total === 35000, 'Cotización esperada');",source:client+`
// TESTS DE ÉXITO: datos y recursos observados tras esperar la promesa.
const data = await readQuote(mockFetch());
assert(data.total === 35000 && data.currency === 'COP', 'Cotización de 35000 COP');
assert(resources.activeTimers === 0, 'Timer liberado en éxito');
assert(resources.cleared === 1, 'Finally ejecutado una vez');
console.log('Respuesta válida:', data);`},
 {id:'http',title:'Distingue los errores HTTP',goal:'Comprueba 404 y 503 sin clasificarlos como fallos de red: sí hubo una respuesta HTTP.',steps:['El doble responde con status 404 o 503 y ok: false.','Observa que el cliente revisa response.ok antes de leer el cuerpo.','Ejecuta y comprueba el tipo del error, el status y la limpieza del timer.'],expected:'HttpError con 404 y 503 · no se leen como cotizaciones',hintTitle:'fetch puede resolver aunque el status sea un error',hint:'Una respuesta 404 o 503 no hace que fetch rechace automáticamente. El cliente consulta response.ok y genera un error HTTP con su status. El error de red se practica en el siguiente desafío.',snippet:"if (!response.ok) throw new HttpError(response.status);",source:client+'\n'+rejection+`
// TESTS HTTP: cada respuesta conserva su propio status.
for (const status of [404, 503]) {
  const error = await rejected(() => readQuote(mockFetch('http', status)));
  assert(error instanceof HttpError, 'Clasificado como error HTTP');
  assert(error.status === status, 'Status HTTP ' + status);
  assert(resources.activeTimers === 0, 'Timer liberado tras HTTP ' + status);
  console.log('Respuesta recibida; error HTTP:', error.status);
}`},
 {id:'network',title:'Reconoce un fallo de red',goal:'Prueba una promesa rechazada por el transporte sin inventarle un status HTTP.',steps:['Localiza el TypeError que lanza el doble antes de devolver una respuesta.','Ejecuta el cliente y captura el rechazo esperado.','Comprueba que no es HttpError y que finally libera el timer.'],expected:'TypeError de red · sin status HTTP · cero timers activos',hintTitle:'Sin respuesta no hay status que comprobar',hint:'Un rechazo de red no es HTTP 500 ni 503. En este doble, TypeError representa el fallo de transporte. Comprueba su tipo y que error.status no existe.',snippet:"assert(error instanceof TypeError, 'Rechazo de red');\nassert(error.status === undefined, 'Sin status HTTP');",source:client+'\n'+rejection+`
// TESTS DE RED: el transporte rechaza, no existe una respuesta HTTP.
const error = await rejected(() => readQuote(mockFetch('network')));
assert(error instanceof TypeError, 'Rechazo de red');
assert(!(error instanceof HttpError), 'No es un error HTTP');
assert(error.status === undefined, 'Sin status HTTP');
assert(resources.activeTimers === 0, 'Timer liberado tras fallo de red');
console.log('Causa observada:', error.name, error.message);`},
 {id:'timeout',title:'Cancela a tiempo',goal:'Cancela una petición pendiente con AbortController y comprueba que el cliente distingue timeout de error HTTP y red.',steps:['El doble pending espera hasta que reciba la señal de cancelación.','Ejecuta: el timer aborta la operación y el cliente identifica TimeoutError.','Comprueba la señal observada y que no queden temporizadores activos.'],expected:'TimeoutError · señal abort recibida una vez · timer liberado',hintTitle:'Cancelar la espera debe cancelar la operación',hint:'Promise.race por sí solo no detiene un fetch pendiente. AbortController envía una señal que el doble escucha. El cliente convierte el AbortError provocado por su plazo en TimeoutError; finally limpia el timer.',snippet:"const error = await rejected(() => readQuote(mockFetch('pending'), 30));\nassert(error instanceof TimeoutError, 'Timeout identificado');",source:client+'\n'+rejection+`
// TESTS DE TIMEOUT: usa una señal real, sin depender de una URL lenta.
const error = await rejected(() => readQuote(mockFetch('pending'), 30));
assert(error instanceof TimeoutError, 'Timeout identificado');
assert(resources.aborted === 1, 'Operación cancelada mediante AbortSignal');
assert(resources.activeTimers === 0, 'Timer liberado tras timeout');
console.log('Causa observada:', error.name, 'Cancelaciones:', resources.aborted);`},
 {id:'matrix',title:'Comprueba la matriz completa',goal:'Reúne los cinco escenarios en una ejecución y verifica sus causas y recursos antes de preparar la evidencia.',steps:['Recorre éxito, HTTP 404, HTTP 503, red y timeout con el mismo cliente.','Cada caso compara la causa observada con su expectativa.','Revisa la tabla calculada, descarga la matriz y guarda código y salida.'],expected:'Cinco escenarios correctos · causas diferenciadas · cero timers pendientes',hintTitle:'El rechazo esperado también puede ser una prueba aprobada',hint:'La aserción valida que ocurrió la causa esperada. Un error HTTP o un timeout bien comprobado no hace fallar la prueba. Si cambia la causa obtenida, la aserción sí debe fallar.',snippet:"assert(observed === scenario.expected, 'Causa de ' + scenario.id);\nassert(resources.activeTimers === 0, 'Sin timer pendiente');",source:client+`
// MATRIZ: los resultados se calculan ejecutando el cliente, no se precargan.
const scenarios = [
  { id: 'Éxito', mode: 'http', status: 200, expected: 'success' },
  { id: 'HTTP 404', mode: 'http', status: 404, expected: 'http' },
  { id: 'HTTP 503', mode: 'http', status: 503, expected: 'http' },
  { id: 'Red', mode: 'network', expected: 'network' },
  { id: 'Timeout', mode: 'pending', expected: 'timeout' }
];
const matrix = [];
for (const scenario of scenarios) {
  let observed, status;
  try {
    const data = await readQuote(mockFetch(scenario.mode, scenario.status), 30);
    assert(data.total === 35000, 'Total de éxito');
    observed = 'success'; status = 200;
  } catch (error) {
    observed = error instanceof HttpError ? 'http'
      : error instanceof TimeoutError ? 'timeout'
      : error instanceof TypeError ? 'network' : 'unexpected';
    status = error.status;
  }
  assert(observed === scenario.expected, 'Causa de ' + scenario.id);
  if (scenario.expected === 'http') assert(status === scenario.status, 'Status de ' + scenario.id);
  assert(resources.activeTimers === 0, 'Sin timer pendiente: ' + scenario.id);
  matrix.push({ scenario: scenario.id, expected: scenario.expected, observed,
    status: status ?? null, activeTimers: resources.activeTimers });
}
assert(resources.cleared === 5, 'Finally ejecutado en los cinco casos');
assert(resources.aborted === 1, 'Una operación cancelada');
console.log('ASYNC_MATRIX=' + JSON.stringify(matrix));`}
];
export const asyncReference=[['Éxito','Respuesta 200','success','Datos de la cotización'],['HTTP 404','Respuesta 404','http','Recurso no encontrado'],['HTTP 503','Respuesta 503','http','Servicio no disponible'],['Red','La promesa rechaza','network','No se obtuvo respuesta HTTP'],['Timeout','La señal cancela la espera','timeout','Se agotó el plazo del cliente']];
export type AsyncRow={scenario:string;expected:string;observed:string;status:number|null;activeTimers:number};
export function asyncReady(run?:PracticeRun){return !!run&&run.mode==='code'&&run.ok&&/^Aserciones ejecutadas: [1-9]\d*$/m.test(run.output)}
export function readAsyncMatrix(run?:PracticeRun):AsyncRow[]{
 if(!asyncReady(run))return [];
 try{const line=run!.output.split('\n').find(value=>value.startsWith('ASYNC_MATRIX='));if(!line)return [];const rows:unknown=JSON.parse(line.slice(13));if(!Array.isArray(rows)||rows.length!==5)return [];
  return rows.every(row=>row&&typeof row.scenario==='string'&&typeof row.expected==='string'&&typeof row.observed==='string'&&['success','http','network','timeout'].includes(row.observed)&&(row.status===null||Number.isInteger(row.status))&&Number.isInteger(row.activeTimers))?rows:[];
 }catch{return []}
}
export const asyncReflections=[
 {title:'¿Dónde esperaste y dónde capturaste el error?',help:'Explica el papel de await, try/catch y finally en el cliente que ejecutaste.',hint:'await espera la respuesta y el cuerpo. catch clasifica o propaga errores. finally libera el timer aunque la promesa rechace. Relaciona tu explicación con una aserción real.',placeholder:'Esperé… Capturé… Finally comprobó…'},
 {title:'¿Cómo distinguiste las causas?',help:'Compara HTTP 404/503 con fallo de red y timeout. Describe el esperado frente al observado.',hint:'HTTP tiene una respuesta con status. El fallo de red no trae status. El timeout de este cliente cancela mediante AbortController y se convierte en TimeoutError.',placeholder:'En HTTP esperaba… En red obtuve… En timeout observé…'},
 {title:'¿Qué demuestra tu ejecución?',help:'Indica escenarios, aserciones y recursos liberados. Distingue los dobles locales de una prueba contra un servicio real.',hint:'Las promesas, las aserciones y la señal se ejecutan de verdad; fetch está inyectado con datos ficticios. No afirmes haber probado conectividad externa. La matriz debe salir de una ejecución.',placeholder:'Ejecuté… La aserción confirmó… El timer… Queda pendiente…'}
];
export function asyncEvidence(run:PracticeRun|undefined,values:string[],labels:string[]){return ['# Semana 12 · Asincronía, HTTP, red y timeout','Pruebas ejecutadas en el sandbox con fetch inyectado y dobles locales. No demuestran conectividad con un servicio externo.',...(run?['Fecha: '+run.at,'Resultado: '+(asyncReady(run)?'Aserciones correctas':'Por revisar'),'## Código ejecutado','```javascript',run.source,'```','## Salida real','```text',run.output,'```']:['Sin ejecución registrada.']),...labels.flatMap((label,i)=>['## '+label,values[i]?.trim()||'Reflexión opcional pendiente.'])].join('\n\n')}
