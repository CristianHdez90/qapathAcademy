import {readProgrammingNotebook,type ProgrammingNotebook,type ProgrammingSnapshot} from '@qapath/progress';
import type {PracticeRun} from '@/components/academy/practice-execution';
export function programmingSnapshot(run:PracticeRun,experiment?:string):ProgrammingSnapshot{return {mode:run.mode==='git'?'git':'code',source:run.source,output:run.output,ok:run.ok,at:run.at,...(experiment?{experiment}:{}),...(run.gitProof?{gitProof:run.gitProof}:{})}}
export function programmingEvidence(run?:PracticeRun):ProgrammingNotebook{const book=readProgrammingNotebook(run);if(!run||run.programmingNotebook)return book;if(run.mode==='code')book.code=programmingSnapshot(run,'free');if(run.mode==='git')book.git=programmingSnapshot(run);return book}
const implementation=`// REGLA DE NEGOCIO · calcula una cotización en COP.
// Entradas: cantidad, cupón opcional y tipo de envío.
function total(quantity, coupon = '', shipping = 'pickup') {
  // Solo se aceptan cantidades enteras entre 1 y 5.
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 5) {
    throw new RangeError('Cantidad inválida');
  }
  // Rechaza cupones y tipos de envío que no estén definidos.
  if (!['', 'QA10'].includes(coupon)) throw new RangeError('Cupón inválido');
  if (!['pickup', 'delivery'].includes(shipping)) throw new RangeError('Envío inválido');

  // Cada unidad cuesta 35.000 COP; QA10 exige al menos 100.000 COP.
  const subtotal = 35000 * quantity;
  if (coupon === 'QA10' && subtotal < 100000) {
    throw new RangeError('Subtotal insuficiente');
  }
  const discount = coupon === 'QA10' ? Math.round(subtotal * 0.1) : 0;
  const delivery = shipping === 'delivery' ? 10000 : 0;

  // Aplica el descuento al subtotal y suma el envío sin descontarlo.
  return subtotal - discount + delivery;
}`;
const assertions=`

// TEST 1 · una unidad sin cupón ni envío debe costar 35.000 COP.
// assert falla si la comparación con === no se cumple.
assert(total(1) === 35000, 'Cotización básica');

// TEST 2 · tres unidades con QA10 y entrega deben costar 104.500 COP.
// Esperado: 105.000 - 10.500 + 10.000. El envío no recibe descuento.
const obtained = total(3, 'QA10', 'delivery');
// console.log muestra el valor real; por sí solo no valida la prueba.
console.log('Esperado: 104500 COP · Obtenido: ' + obtained + ' COP');
assert(obtained === 104500, 'Descuento sin afectar envío');`;
export const programmingExperiments=[
 {id:'baseline',title:'Tu primera comprobación',goal:'Ejecuta las aserciones, identifica entrada y resultado esperado, y modifica una expectativa para observar cómo falla una prueba.',hint:'assert compara una condición. === comprueba igualdad estricta; console.log muestra datos, pero no valida. Para total(1), el resultado esperado es 35000 COP.',source:implementation+assertions},
 {id:'boundaries',title:'Explora límites e inválidos',goal:'Observa las fronteras 1 y 5, y verifica que −1, 0, 6 y 1.5 se rechacen. Revisa también cupones y mínimo de compra.',hint:'Cada valor inválido debe lanzar RangeError. El try/catch captura ese error esperado; si no se lanza, la aserción debe fallar. Un rechazo esperado también puede ser una prueba correcta.',source:implementation+`

// TESTS DE FRONTERA · ambos extremos del intervalo son válidos.
assert(total(1) === 35000, 'Frontera mínima: 1');
assert(total(5) === 175000, 'Frontera máxima: 5');

// AYUDANTE · verifica que una entrada inválida lance RangeError.
// Si no hay error, o aparece otro tipo de error, la prueba falla.
function rejects(action, message) {
  let rejected = false;
  try {
    action();
  } catch (error) {
    rejected = error instanceof RangeError;
  }
  assert(rejected, message);
}

// TESTS INVÁLIDOS · negativos, cero, exceso y cantidad decimal.
for (const quantity of [-1, 0, 6, 1.5]) {
  rejects(() => total(quantity), 'Rechaza cantidad ' + quantity);
}
// TEST DE MÍNIMO · dos unidades no alcanzan el mínimo del cupón.
rejects(() => total(2, 'QA10'), 'Rechaza QA10 bajo el mínimo');
// TEST DE CUPÓN · un código desconocido debe rechazarse.
rejects(() => total(3, 'OTRO'), 'Rechaza cupón desconocido');`},
 {id:'mutation',title:'Atrapa el descuento incorrecto',goal:'Esta versión aplica el descuento también al envío. Ejecuta la prueba y explica por qué obtener 103500 COP en lugar de 104500 revela un defecto.',hint:'La línea return multiplica subtotal + envío por 0.9. QA10 debe descontarse solo del subtotal. Corrige esa línea y vuelve a ejecutar las mismas aserciones.',source:implementation.replace('  // Aplica el descuento al subtotal y suma el envío sin descontarlo.\n  return subtotal - discount + delivery;',"  // DEFECTO INTENCIONAL · esta fórmula también descuenta el envío.\n  // El TEST 2 debe detectar la diferencia frente a la regla de negocio.\n  return Math.round((subtotal + delivery) * (coupon === 'QA10' ? 0.9 : 1));")+assertions},
 {id:'retest',title:'Comprueba la corrección',goal:'Ejecuta la versión corregida y compara con el fallo anterior. El total debe volver a 104500 COP, con las mismas entradas.',hint:'La corrección resta discount al subtotal y después suma delivery. Repetir la misma prueba permite confirmar que el comportamiento volvió a cumplir la regla.',source:'// RETEST · repite las mismas pruebas con la fórmula corregida.\n'+implementation+assertions}
];
export const programmingReflections=[
 {title:'¿Qué regla comprobaste?',help:'Relaciona entradas, condición y resultado esperado de una aserción que ejecutaste.',hint:'Por ejemplo: quantity=1 produce 35000. Con quantity=0 debe lanzarse RangeError. Explica cómo la aserción distingue el esperado del obtenido.',placeholder:'Probé la entrada… Esperaba… La aserción comprueba…'},
 {title:'¿Qué te enseñó el fallo y el retest?',help:'Compara el descuento incorrecto con la corrección. Si no ejecutaste ese experimento, describe otro resultado real.',hint:'En el defecto, 105000 + 10000 se multiplica por 0.9 y da 103500. La regla correcta es 105000 − 10500 + 10000 = 104500. No presentes un fallo como ejecutado si solo leíste el ejemplo.',placeholder:'La prueba detectó… El resultado obtenido fue… Después de corregir…'},
 {title:'¿Qué conservaste en Git?',help:'Explica la diferencia entre guardar, preparar y confirmar, y relaciona la entrega con el SHA observado.',hint:'Guardar modifica el archivo; git add prepara esa versión; git commit crea un registro. Si editas después de add, debes guardar y preparar de nuevo. El SHA identifica el commit; no es una publicación.',placeholder:'Guardé… Preparé mediante… El commit identificado por…'}
];
export function buildProgrammingEvidence(run:PracticeRun|undefined,values:string[],labels:string[]){const book=programmingEvidence(run),lines=['# Semana 9 · Bitácora de JavaScript y Git','Ejecuciones realizadas en el navegador. El código se ejecuta en un entorno aislado; el repositorio Git es local a este navegador. Esto no demuestra una ejecución externa de Node.js.'];for(const [title,item] of [['JavaScript · última ejecución',book.code],['Fallo investigado conservado',book.mutation],['Git · última operación y entrega',book.git]] as const){lines.push('## '+title);if(!item){lines.push('Sin ejecución registrada.');continue}lines.push('Fecha: '+item.at,'Resultado de ejecución: '+(item.ok?'Correcto':'Por revisar'),'### Código o archivo adjunto','```'+(item.mode==='git'?'markdown':'javascript'),item.source,'```','### Salida obtenida','```text',item.output,'```');if(item.gitProof)lines.push('Commit observado: '+(item.gitProof.head||'Sin commit'),'Rama: '+item.gitProof.branch,'Archivo del editor coincide con el commit: '+(item.gitProof.fileMatchesEditor?'Sí':'No'),'Árbol de trabajo limpio: '+(item.gitProof.clean?'Sí':'No'),'Publicación en origin de entrenamiento verificada: '+(item.gitProof.published?'Sí':'No'),'Commit en origin: '+(item.gitProof.publishedHead||'Sin publicación verificada'),'Rama en origin: '+(item.gitProof.publishedBranch||'Sin rama verificada'))}labels.forEach((label,i)=>lines.push('## '+label,values[i]?.trim()||'Reflexión opcional pendiente.'));return lines.join('\n\n')}
