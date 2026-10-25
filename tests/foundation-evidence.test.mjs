import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript'),progress=require('../libs/progress/dist/index.js'),module={exports:{}};
new Function('module','exports','require',ts.transpileModule(readFileSync(new URL('../apps/web/src/features/practice/foundation-evidence.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(module,module.exports,()=>progress);
const {foundationEvidenceSummary,buildFoundationEvidenceMarkdown}=module.exports;
function failed(){const example=progress.foundationExamples[0],row={id:'TC-01',exampleId:example.id,criterion:example.criterion,title:'Transferencia válida',preconditions:'Cuenta activa',data:JSON.stringify(example.data),steps:'1. Preparar\n2. Transferir\n3. Consultar',expected:example.expected,observed:progress.executeTransfer(example.data,true).outcome,status:'Fallido',bug:'BUG-01 Saldo incorrecto'};row.execution={fingerprint:progress.caseFingerprint(row),obtained:row.observed,defect:true};return row}
test('foundation evidence distinguishes current failures from stale executions and never counts reference cases',()=>{
 const row=failed();const summary=foundationEvidenceSummary([row]);assert.equal(summary.executed,1);assert.equal(summary.failed,1);assert.equal(summary.assessment.covered.length,1);
 row.title+=' modificado';const stale=foundationEvidenceSummary([row]);assert.equal(stale.executed,0);assert.equal(stale.failed,0);assert.equal(stale.stale,1);assert.equal(stale.assessment.covered.length,0);
});
test('download keeps test actions, separate expected and obtained results, bugs and partial reflections',()=>{
 const markdown=buildFoundationEvidenceMarkdown([failed()],['Mi análisis de CA-01','',''],['Diseño','Resultados','Conclusión']);assert.match(markdown,/Resultado esperado\nSaldo 150; aceptada/);assert.match(markdown,/Resultado obtenido \(observado\)\nSaldo 195; aceptada/);assert.match(markdown,/BUG-01/);assert.match(markdown,/defecto simulado/);assert.match(markdown,/1\. Preparar/);assert.match(markdown,/Mi análisis de CA-01/);assert.match(markdown,/Sin respuesta todavía/);
});
