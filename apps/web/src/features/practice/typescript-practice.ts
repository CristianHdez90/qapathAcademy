import type {PracticeRun} from '@/components/academy/practice-execution';
export type TypeScriptCheck={ok:boolean;output:string;at:string};
const models=`// Contratos de entrenamiento: los tipos describen datos, no los validan.
interface QuoteInput { quantity: number }
interface QuoteResult { total: number; currency: 'COP' }
type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
`;
const guard=`// La frontera recibe unknown: primero comprobamos su estructura.
function valid(value: unknown): value is QuoteResult {
  return typeof value === 'object' && value !== null
    && 'total' in value && typeof value.total === 'number'
    && Number.isFinite(value.total) && value.total >= 0
    && 'currency' in value && value.currency === 'COP';
}
`;
const corrected=models+`
// La cantidad debe ser un número. El chequeo strict acepta esta versión.
const input: QuoteInput = { quantity: 3 };
assert(typeof input.quantity === 'number', 'Cantidad numérica');
console.log('Cantidad recibida:', input.quantity);`;
export const typeChallenges=[
 {id:'model',title:'Dibuja el contrato',goal:'Modela entrada, cotización y resultado de API. Comprueba la rama antes de acceder a data.',steps:['Lee QuoteInput, QuoteResult y las dos ramas de ApiResult.','Pulsa Comprobar tipos strict para revisar el código sin ejecutarlo.','Ejecuta las aserciones y compara las ramas de éxito y error.'],expected:'Tipos sin errores · cotización de 35.000 COP · error explícito',hintTitle:'Dos ramas, un discriminante',hint:'success es el discriminante: si es true, puedes leer data. Si es false, lee error. Una aserción comprueba el comportamiento durante la ejecución.',snippet:"if (response.success) {\n  console.log(response.data.total);\n} else {\n  console.log(response.error);\n}",source:models+`
function describe(response: ApiResult<QuoteResult>): string {
  // El if permite a TypeScript distinguir las dos formas del contrato.
  if (response.success) return response.data.total + ' ' + response.data.currency;
  return 'Error: ' + response.error;
}
const input: QuoteInput = { quantity: 1 };
const success: ApiResult<QuoteResult> = {
  success: true, data: { total: 35000 * input.quantity, currency: 'COP' }
};
const failure: ApiResult<QuoteResult> = { success: false, error: 'Sin stock' };
// TESTS: éxito y error deben tener respuestas distintas.
assert(describe(success) === '35000 COP', 'Contrato de éxito');
assert(describe(failure) === 'Error: Sin stock', 'Contrato de error');
console.log(describe(success), describe(failure));`},
 {id:'strict',title:'Atrapa el error de tipos',goal:'Observa el diagnóstico real al asignar texto donde se espera un número. Después carga la corrección y compara.',steps:['Pulsa Comprobar tipos strict: se espera el diagnóstico TS2322.','Lee la línea del error. Ejecutar código transpila y no sustituye ese chequeo.','Carga la corrección, comprueba tipos y ejecuta la aserción numérica.'],expected:'La versión inicial produce TS2322; la corrección acepta quantity: 3',hintTitle:'Un texto "3" no es el número 3',hint:'QuoteInput exige quantity: number. Cambiar el dato a 3 corrige el contrato. Usar as o any para esconder el error no convierte el valor real.',snippet:'const input: QuoteInput = { quantity: 3 };',source:models+`
// ERROR INTENCIONAL: el dato de entrada tiene un tipo incompatible.
const input: QuoteInput = { quantity: '3' };
// TEST: transpilar elimina tipos; esta aserción descubre el texto en runtime.
assert(typeof input.quantity === 'number', 'Cantidad numérica');
console.log('Cantidad recibida:', input.quantity);`,corrected},
 {id:'guard',title:'Valida datos desconocidos',goal:'Recibe objetos como unknown y verifica su contenido antes de tratarlos como cotizaciones.',steps:['Abre los datos de entrenamiento y compara válidos e inválidos.','Revisa cómo valid verifica total y currency sin confiar en un cast.','Comprueba tipos y ejecuta pruebas para nulos, ausentes y tipos incorrectos.'],expected:'Acepta COP con total numérico válido · rechaza cinco entradas inválidas',hintTitle:'unknown te obliga a comprobar',hint:'Un JSON puede traer null, total ausente o texto. Un type guard inspecciona el valor. Escribir value as QuoteResult no comprueba ninguno de sus campos.',snippet:"typeof value === 'object' && value !== null\n// Después revisa total y currency.",source:models+'\n'+guard+`
// TEST POSITIVO: estructura y valores acordados.
assert(valid({ total: 35000, currency: 'COP' }), 'Acepta cotización válida');
// TESTS NEGATIVOS: cada entrada se comprueba durante la ejecución.
assert(!valid(null), 'Rechaza null');
assert(!valid({ currency: 'COP' }), 'Rechaza total ausente');
assert(!valid({ total: '35000', currency: 'COP' }), 'Rechaza total de texto');
assert(!valid({ total: 35000, currency: 'USD' }), 'Rechaza moneda distinta');
assert(!valid({ total: -1, currency: 'COP' }), 'Rechaza total negativo');
console.log('Contrato válido e inválidos comprobados');`},
 {id:'client',title:'Entrega un cliente confiable',goal:'Separa la recepción de datos del cálculo y devuelve éxito o error como parte del contrato.',steps:['Revisa el cliente: recibe un dato ficticio, valida y devuelve ApiResult.','Comprueba tipos y ejecuta tanto éxito como errores de contrato.','Revisa el resumen de comprobaciones y prepara tu evidencia.'],expected:'Cliente tipado · datos válidos aceptados · errores tratados sin leer data',hintTitle:'Valida antes de construir la rama de éxito',hint:'El cliente de este ejemplo usa un doble local, sin red. Solo devuelve success: true cuando valid confirma los campos. La rama de error incluye un mensaje y no tiene data.',snippet:"if (!valid(payload)) return { success: false, error: 'Contrato inválido' };\nreturn { success: true, data: payload };",source:models+'\n'+guard+`
// Doble de cliente local: recibe datos ficticios, sin solicitudes de red.
class QuoteClient {
  read(payload: unknown): ApiResult<QuoteResult> {
    if (!valid(payload)) return { success: false, error: 'Contrato inválido' };
    return { success: true, data: payload };
  }
}
// El cálculo no conoce al cliente ni al transporte.
function subtotal(input: QuoteInput): number { return input.quantity * 35000; }
const client = new QuoteClient();
const success = client.read({ total: subtotal({ quantity: 3 }), currency: 'COP' });
assert(success.success && success.data.total === 105000, 'Cliente acepta datos válidos');
const invalids: unknown[] = [null, {}, { total: '35000', currency: 'COP' },
  { total: 35000, currency: 'USD' }, { total: -1, currency: 'COP' }];
for (const payload of invalids) {
  const result = client.read(payload);
  // El discriminante protege el acceso a error, sin asumir que existe data.
  assert(!result.success && result.error === 'Contrato inválido', 'Cliente rechaza contrato inválido');
}
console.log('Cliente y cálculo separados: éxito y cinco errores comprobados');`}
];
export const contractSamples=[['Válido',"{ total: 35000, currency: 'COP' }",'Aceptar'],['Null','null','Rechazar'],['Sin total',"{ currency: 'COP' }",'Rechazar'],['Total de texto',"{ total: '35000', currency: 'COP' }",'Rechazar'],['Otra moneda',"{ total: 35000, currency: 'USD' }",'Rechazar'],['Negativo',"{ total: -1, currency: 'COP' }",'Rechazar']];
export function typeRuntimeReady(run?:PracticeRun){return !!run&&/^Aserciones ejecutadas: [1-9]\d*$/m.test(run.output)}
export function typePracticeReady(run?:PracticeRun){return typeRuntimeReady(run)&&run?.typescriptCheck?.ok===true}
export const typeReflections=[
 {title:'¿Cómo distinguiste éxito y error?',help:'Explica el discriminante y cuándo se puede acceder a data o error.',hint:'ApiResult tiene dos ramas. Comprueba success antes de acceder al contenido de cada una. Cuenta una aserción que realmente ejecutaste.',placeholder:'La rama… contiene… Comprobé…'},
 {title:'¿Qué rechazó tu validador?',help:'Compara un dato válido con un dato inválido y describe el resultado observado.',hint:'Un cast no revisa un JSON. valid recibe unknown y comprueba null, total numérico y currency COP. Explica qué caso rechazó tu ejecución.',placeholder:'Con la entrada… esperaba… La aserción obtuvo…'},
 {title:'¿Qué demostró cada comprobación?',help:'Separa el diagnóstico de tipos del resultado de ejecutar las aserciones.',hint:'TS2322 detecta texto en una propiedad numérica antes de ejecutar. Una aserción inspecciona un valor real. El chequeo integrado usa strict y declaraciones del sandbox; el kit permite repetir tsc en tu equipo.',placeholder:'El chequeo strict indicó… Al ejecutar… Queda pendiente…'}
];
export function typeEvidence(run:PracticeRun|undefined,values:string[],labels:string[]){return ['# Semana 11 · Contratos y errores con TypeScript','Chequeo estático integrado con strict y biblioteca del sandbox. Ejecución aislada de aserciones; los ejemplos de cliente usan datos locales sin red.',...(run?['Fecha: '+run.at,'## TypeScript adjunto','```typescript',run.source,'```','## Chequeo estático de esta versión',run.typescriptCheck?run.typescriptCheck.at+'\n'+run.typescriptCheck.output:'Sin comprobación de tipos adjunta.','## Salida de ejecución','```text',run.output,'```']:['Sin ejecución ni chequeo registrados.']),...labels.flatMap((label,i)=>['## '+label,values[i]?.trim()||'Reflexión opcional pendiente.'])].join('\n\n')}
