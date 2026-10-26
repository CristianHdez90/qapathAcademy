import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const require=createRequire(import.meta.url),ts=require('typescript'),module={exports:{}};
new Function('module','exports',ts.transpileModule(readFileSync(new URL('../apps/web/src/features/practice/json-report-practice.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(module,module.exports);
const h=module.exports;
function execute(source){const logs=[];let checks=0;new Script(source).runInNewContext({console:{log:(...values)=>logs.push(values.map(value=>typeof value==='string'?value:JSON.stringify(value)).join(' '))},assert:(condition,message)=>{checks++;assert.ok(condition,message)}},{timeout:1000});return {checks,output:logs.join('\n')+'\nAserciones ejecutadas: '+checks}}
test('report challenges use the kit fixture and execute meaningful assertions',()=>{
 assert.deepEqual(h.reportFixture,JSON.parse(readFileSync(new URL('../apps/web/public/practice/kit/data/results.json',import.meta.url),'utf8')));
 for(const challenge of h.reportChallenges){const result=execute(challenge.source);assert.ok(result.checks>=2,challenge.id);assert.ok(challenge.source.length<=6000)}
});
test('final report includes 60 percent, ordered failures and boundary validations',()=>{
 const source=h.reportChallenges.at(-1).source,result=execute(source),run={mode:'code',ok:true,...result,source,at:'2026-10-25T12:00:00Z'};
 assert.deepEqual(h.readGeneratedSummary(run),{passed:3,failed:2,blocked:1,total:6,executed:5,passRate:60,failedIds:['TC-03','TC-05']});
 assert.throws(()=>execute(source.replace('totals.passed / executed * 100','totals.passed / totals.total * 100')),/Aprobación sobre ejecutados/);
 assert.throws(()=>execute(source.replace("throw new RangeError('Estado desconocido: ' + row.status);","return totals;")),/Estado desconocido rechazado/);
 assert.equal(h.hasReportAssertions({...run,output:'Solo imprimí datos'}),false);
 assert.equal(h.readGeneratedSummary({...run,ok:false}),null);
 assert.equal(h.readGeneratedSummary({...run,output:'SUMMARY_JSON={invalido}\nAserciones ejecutadas: 1'}),null);
 const report=h.reportEvidence(run,['Usé reduce','3 de 5 ejecutados','Comprobé vacío'],['Transformación','Tasa','Pruebas']);assert.ok(report.includes(source));assert.ok(report.includes(result.output));assert.ok(report.includes(run.at));
 const saved=JSON.stringify({week:10,execution:{...run,config:{quantity:'1'},settings:{stage:'report:robust'}},fields:['x'.repeat(1000),'x'.repeat(1000),'x'.repeat(1000)],completion:'draft'});assert.ok(saved.length<8000,'full notes fit the existing evidence limit');
});
