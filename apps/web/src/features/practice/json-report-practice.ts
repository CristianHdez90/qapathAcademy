import type {PracticeRun} from '@/components/academy/practice-execution';

export const reportFixture=[{id:'TC-01',status:'passed'},{id:'TC-02',status:'passed'},{id:'TC-03',status:'failed'},{id:'TC-04',status:'blocked'},{id:'TC-05',status:'failed'},{id:'TC-06',status:'passed'}];
const fixture=`// Datos ficticios del kit: data/results.json.
const results = ${JSON.stringify(reportFixture,null,2)};
`;
const counter=`// reduce construye los contadores a partir de los datos.
function count(rows) {
  return rows.reduce((totals, row) => {
    // Nunca cuentes un estado desconocido como aprobado.
    if (!['passed', 'failed', 'blocked'].includes(row.status)) {
      throw new RangeError('Estado desconocido: ' + row.status);
    }
    totals[row.status] += 1;
    totals.total += 1;
    return totals;
  }, {passed: 0, failed: 0, blocked: 0, total: 0});
}
`;
const summary=`// Resumen reutilizable: no modifica el arreglo recibido.
function summarize(rows) {
  const totals = count(rows);
  const executed = totals.passed + totals.failed;
  return {
    ...totals,
    executed,
    // Sin ejecutados no hay una tasa de aprobación: usamos null.
    passRate: executed ? totals.passed / executed * 100 : null,
    failedIds: rows.filter(row => row.status === 'failed')
      .map(row => row.id).sort()
  };
}
`;
export const reportChallenges=[
 {id:'counts',title:'Cuenta los estados',goal:'Transforma seis resultados en un resumen con reduce y comprueba cada contador.',steps:['Abre la pista de datos e identifica los tres estados.','Ejecuta las cuatro aserciones y compara los contadores.','Cambia una expectativa para observar cómo falla la comprobación.'],hintTitle:'Un acumulador, cuatro contadores',hint:'reduce recorre cada fila y suma en la propiedad de su estado. El valor inicial incluye passed, failed, blocked y total en cero.',snippet:'totals[row.status] += 1;\ntotals.total += 1;',expected:'3 aprobados · 2 fallidos · 1 bloqueado · 6 en total',source:fixture+'\n'+counter+`
const summary = count(results);
// TESTS · valida cada estado y el total, sin escribir contadores a mano.
assert(summary.passed === 3, 'Tres aprobados');
assert(summary.failed === 2, 'Dos fallidos');
assert(summary.blocked === 1, 'Un bloqueado');
assert(summary.total === 6, 'Seis casos en total');
console.log('Resumen calculado:', summary);`},
 {id:'failures',title:'Encuentra los fallos',goal:'Extrae y ordena los identificadores fallidos sin cambiar el orden de los datos originales.',steps:['Observa que la entrada de este desafío está desordenada.','Sigue filter → map → sort y ejecuta las aserciones.','Comprueba que el arreglo de entrada conserva su contenido y orden.'],hintTitle:'Filtra primero, ordena una lista nueva',hint:'filter selecciona fallidos; map crea otra lista con sus id. sort modifica esa lista nueva. Ordenar results directamente modificaría el fixture.',snippet:"results.filter(row => row.status === 'failed')\n  .map(row => row.id).sort();",expected:'TC-03 y TC-05 · entrada sin cambios',source:fixture+`
// Invierte una copia para probar una entrada desordenada.
const shuffled = [...results].reverse();
const before = JSON.stringify(shuffled);
const failedIds = shuffled.filter(row => row.status === 'failed')
  .map(row => row.id).sort();

// TEST 1 · solo los fallidos, ordenados por identificador.
assert(JSON.stringify(failedIds) === '["TC-03","TC-05"]', 'Fallidos ordenados');
// TEST 2 · la transformación no debe modificar la entrada.
assert(JSON.stringify(shuffled) === before, 'Entrada sin cambios');
console.log('Fallidos:', failedIds);`},
 {id:'rates',title:'Elige el denominador',goal:'Distingue aprobación sobre ejecutados de aprobación sobre el total del reporte.',steps:['Elige qué estados representan una prueba ejecutada.','Calcula la aprobación usando passed + failed como denominador.','Compara 60 % sobre ejecutados con 50 % sobre el total.'],hintTitle:'Bloqueado no significa ejecutado',hint:'Hay cinco ejecutados: tres passed y dos failed. blocked queda fuera del denominador de aprobación. Con cero ejecutados, muestra «Sin ejecutados» en lugar de dividir por cero.',snippet:'const executed = totals.passed + totals.failed;\nconst passRate = executed ? totals.passed / executed * 100 : null;',expected:'3 / 5 = 60 % sobre ejecutados · 3 / 6 = 50 % sobre total',source:fixture+'\n'+counter+`
const totals = count(results);
const executed = totals.passed + totals.failed;
// Bloqueados quedan fuera de la tasa de aprobación sobre ejecutados.
const passRate = executed ? totals.passed / executed * 100 : null;
const passedOverTotal = totals.total ? totals.passed / totals.total * 100 : null;

assert(executed === 5, 'Cinco casos ejecutados');
assert(passRate === 60, 'Aprobación sobre ejecutados: 60 %');
assert(passedOverTotal === 50, 'Aprobados sobre total: 50 %');
console.log({executed, passRate, passedOverTotal});`},
 {id:'robust',title:'Entrega un reporte confiable',goal:'Genera summary.json y prueba datos normales, vacíos, desconocidos y desordenados.',steps:['Ejecuta las mismas reglas en una función summarize.','Revisa los casos vacío, solo bloqueados y estado desconocido.','Descarga summary.json y prepara tu evidencia con el código y la salida real.'],hintTitle:'Un reporte también necesita pruebas negativas',hint:'Para [] y para casos solo bloqueados, passRate debe ser null. Un estado desconocido debe lanzar RangeError. Compara la entrada antes y después para detectar mutaciones.',snippet:"assert(summarize([]).passRate === null, 'Vacío sin división por cero');\n// El estado unknown debe rechazarse, nunca sumarse a passed.",expected:'Conteos correctos · 60 % · orden estable · vacíos seguros · estados desconocidos rechazados',source:fixture+'\n'+counter+'\n'+summary+`
const report = summarize(results);
// TESTS · resultados de la entrada normal.
assert(report.total === 6 && report.passed === 3 && report.failed === 2 && report.blocked === 1, 'Totales del reporte');
assert(report.passRate === 60, 'Aprobación sobre ejecutados');
assert(JSON.stringify(report.failedIds) === '["TC-03","TC-05"]', 'Fallidos del reporte');

// TESTS · sin ejecutados no se calcula una tasa ficticia.
assert(summarize([]).total === 0 && summarize([]).passRate === null, 'Reporte vacío seguro');
assert(summarize([{id: 'TC-B', status: 'blocked'}]).passRate === null, 'Solo bloqueados: sin ejecutados');

// TEST NEGATIVO · rechaza el estado desconocido de manera explícita.
let rejected = false;
try { summarize([{id: 'TC-X', status: 'unknown'}]); }
catch (error) { rejected = error instanceof RangeError; }
assert(rejected, 'Estado desconocido rechazado');

// TESTS · ordena los fallos sin modificar la entrada desordenada.
const shuffled = [...results].reverse();
const before = JSON.stringify(shuffled);
assert(JSON.stringify(summarize(shuffled).failedIds) === '["TC-03","TC-05"]', 'Orden independiente de la entrada');
assert(JSON.stringify(shuffled) === before, 'Fixture sin mutaciones');
// Esta línea es el contenido calculado de summary.json.
console.log('SUMMARY_JSON=' + JSON.stringify(report));`}
];
export function hasReportAssertions(run?:PracticeRun){return !!run&&run.mode==='code'&&run.ok&&/Aserciones ejecutadas: [1-9]\d*/.test(run.output)}
export function readGeneratedSummary(run?:PracticeRun){if(!hasReportAssertions(run))return null;try{const line=run!.output.split('\n').find(value=>value.startsWith('SUMMARY_JSON='));return line?JSON.parse(line.slice(13)):null}catch{return null}}
export const reportReflections=[
 {title:'¿Cómo transformaste los datos?',help:'Explica qué hicieron reduce, filter, map y sort en la ejecución que realizaste.',hint:'Relaciona cada operación con un resultado: conteos por estado, selección de fallidos, extracción de id y orden de una lista nueva.',placeholder:'Usé… para… La entrada se conservó porque…'},
 {title:'¿Qué significa tu porcentaje?',help:'Escribe el numerador y el denominador. Distingue el esperado del valor observado.',hint:'Con el fixture original: 3 / (3 + 2) = 60 % de aprobación sobre ejecutados. Los bloqueados no se ejecutaron. 3 / 6 = 50 % usa otra base.',placeholder:'Esperaba… Obtuve… El denominador incluye…'},
 {title:'¿Qué casos protegieron tu reporte?',help:'Cuenta qué comprobaste con datos vacíos, estados desconocidos o entradas desordenadas.',hint:'Describe la aserción y su salida real. null indica que no hubo ejecutados; RangeError rechaza unknown; comparar JSON antes y después detecta cambios en la entrada.',placeholder:'Probé… La aserción confirmó… Queda pendiente…'}
];
export function reportEvidence(run:PracticeRun|undefined,values:string[],labels:string[]){return ['# Semana 10 · Reportes JSON con JavaScript',run?'Fecha de ejecución: '+run.at:'Sin ejecución registrada.',run?'Resultado: '+(hasReportAssertions(run)?'Ejecución con aserciones correctas':run.ok?'Sin aserciones comprobadas':'Ejecución con fallo'):'Ejecuta el laboratorio para adjuntar resultados.',...(run?['## Código ejecutado','```javascript',run.source,'```','## Salida real','```text',run.output,'```']:[]),...labels.flatMap((label,i)=>['## '+label,values[i]?.trim()||'Reflexión opcional pendiente.'])].join('\n\n')}
