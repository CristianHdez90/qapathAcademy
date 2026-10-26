import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const require=createRequire(import.meta.url),ts=require('typescript'),module={exports:{}};
new Function('module','exports',ts.transpileModule(readFileSync(new URL('../apps/web/src/features/practice/async-practice.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(module,module.exports);
const h=module.exports;
async function execute(source){
 const logs=[],timers=new Set();let checks=0;
 try{await new Script('(async()=>{\n'+source+'\n})()').runInNewContext({AbortController,DOMException,console:{log:(...values)=>logs.push(values.map(value=>typeof value==='string'?value:JSON.stringify(value)).join(' '))},assert:(condition,message)=>{checks++;assert.ok(condition,message);logs.push('✓ '+message)},setTimeout:(callback,delay)=>{const id=setTimeout(()=>{timers.delete(id);callback()},delay);timers.add(id);return id},clearTimeout:id=>{timers.delete(id);clearTimeout(id)}},{timeout:1000});assert.equal(timers.size,0,'actual timers were cleared');return {checks,output:logs.join('\n')+'\nAserciones ejecutadas: '+checks}}
 finally{for(const id of timers)clearTimeout(id)}
}
test('all async challenges execute real promises and clear actual timers',async()=>{
 for(const challenge of h.asyncChallenges){const result=await execute(challenge.source);assert.ok(result.checks>=3,challenge.id);assert.ok(challenge.source.length<=6000);assert.ok(result.output.length<=2500)}
});
test('final matrix distinguishes five causes and preserves observed status and resources',async()=>{
 const source=h.asyncChallenges.at(-1).source,result=await execute(source),run={mode:'code',source,ok:true,output:result.output,at:'2026-10-26T05:00:00Z'};
 assert.equal(result.checks,15);assert.deepEqual(h.readAsyncMatrix(run).map(row=>[row.observed,row.status,row.activeTimers]),[['success',200,0],['http',404,0],['http',503,0],['network',null,0],['timeout',null,0]]);
 assert.equal(h.asyncReady({...run,output:'Solo datos'}),false);assert.deepEqual(h.readAsyncMatrix({...run,ok:false}),[]);assert.deepEqual(h.readAsyncMatrix({...run,output:'ASYNC_MATRIX={}\nAserciones ejecutadas: 1'}),[]);
 const report=h.asyncEvidence(run,['await y finally','HTTP no es red','Cancelación observada'],['Cliente','Causas','Salida']);for(const expected of [source,result.output,'HTTP no es red',run.at])assert.ok(report.includes(expected));
 const evidence=JSON.stringify({week:12,execution:run,fields:['x'.repeat(500),'x'.repeat(500),'x'.repeat(500)],completion:'draft'});assert.ok(evidence.length<8000,evidence.length);
});
test('incorrect HTTP handling, missing timer cleanup and incorrect expectations fail',async()=>{
 await assert.rejects(execute(h.asyncChallenges[1].source.replace('if (!response.ok)', 'if (false)')),/debía rechazar/);
 await assert.rejects(execute(h.asyncChallenges[0].source.replace('clearTimeout(timer);','// Timer intentionally leaked')),/actual timers were cleared/);
 await assert.rejects(execute(h.asyncChallenges[3].source.replace('resources.aborted === 1','resources.aborted === 2')),/Operación cancelada/);
});
