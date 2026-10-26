import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {readFileSync} from 'node:fs';
const require=createRequire(import.meta.url),ts=require('typescript'),module={exports:{}};
new Function('module','exports',ts.transpileModule(readFileSync(new URL('../apps/web/src/features/practice/locator-practice.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(module,module.exports);const h=module.exports;
test('keyboard completion requires ordered focus, real Tab observations, activation, manual focus review and the result',()=>{
 const seen=['Producto ficticio','Cantidad','Cupón','Envío','Activar defecto de cálculo (solo práctica)','Cotizar'],value={seen,tabs:5,activated:true};assert.equal(h.keyboardComplete(value,true,'35000 COP'),true);
 for(const [candidate,confirmed,total] of [[{...value,tabs:0},true,'35000 COP'],[{...value,activated:false},true,'35000 COP'],[{...value,seen:[...seen].reverse()},true,'35000 COP'],[{...value,seen:seen.slice(0,3)},true,'35000 COP'],[value,false,'35000 COP'],[value,true,'HTTP 422']])assert.equal(h.keyboardComplete(candidate,confirmed,total),false);
});
test('locator records reject malformed configuration and preserve genuine last-check metadata',()=>{
 const record={locatorLabVersion:1,page:4,config:{...h.locatorChallenges[4].config,focusConfirmed:true}},run={mode:'topic',source:JSON.stringify(record),ok:true,output:'Recorrido observado',at:'2026-10-26T09:00:00Z'};assert.deepEqual(h.readLocatorRecord(run),record);for(const source of ['{}','invalid',JSON.stringify({...record,page:8}),JSON.stringify({...record,config:{kind:'other'}})])assert.equal(h.readLocatorRecord({...run,source}),undefined);assert.equal(h.readLocatorRecord({...run,mode:'scenario'}),undefined);
 const report=h.locatorEvidence(run,['Etiqueta','Tab y foco','Validación'],['Locators','Teclado','Resultados']);for(const value of ['Recorrido observado',run.source,'WCAG completa','no demuestra ejecución externa'])assert.ok(report.includes(value));assert.ok(JSON.stringify({week:14,execution:run,fields:['x'.repeat(1000),'x'.repeat(1000),'x'.repeat(1000)]}).length<8000);
});
test('generated locator spec uses scoped exact names and state-based assertions without arbitrary first or sleeps',()=>{
 for(const challenge of h.locatorChallenges){const source=h.locatorSpec(challenge.config);assert.equal(ts.transpileModule(source,{reportDiagnostics:true}).diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);for(const value of ['toHaveCount','HTTP 422','toBeFocused','page.keyboard.press','35000 COP'])assert.ok(source.includes(value));assert.ok(!source.includes('.first()'));assert.ok(!source.includes('waitForTimeout'));assert.ok(source.length<6000)}
 assert.ok(h.locatorSpec({...h.locatorChallenges[0].config,name:"\";throw Error('x');//"}).includes(JSON.stringify("\";throw Error('x');//")));
});
