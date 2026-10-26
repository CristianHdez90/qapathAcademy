import test from 'node:test';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {readFileSync} from 'node:fs';
const require=createRequire(import.meta.url),ts=require('typescript');
function load(path,imports={}){const module={exports:{}};new Function('require','module','exports',ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(id=>imports[id]||require(id),module,module.exports);return module.exports}
const scenario=load('../apps/web/src/features/practice/runtime/browser-scenario.ts'),h=load('../apps/web/src/features/practice/first-ui-practice.ts',{'./runtime/browser-scenario':scenario});
test('UI challenges generate valid commented specs with awaited accessible locators and assertion',()=>{
 for(const item of h.firstUiChallenges){const source=h.uiSpec(item.config);assert.equal(ts.transpileModule(source,{reportDiagnostics:true}).diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);for(const text of ['// Given','// When','// Then','await page.getByLabel','await page.getByRole','await expect('])assert.ok(source.includes(text));assert.ok(source.includes(JSON.stringify(item.config.expected)));assert.ok(source.length<=6000)}
 assert.equal(h.firstUiChallenges[1].config.expected,'150000 COP');assert.equal(h.firstUiChallenges[2].config.expected,'104500 COP');
});
test('only a real mismatched basic quote is classified as the intended failure',()=>{
 const run={mode:'scenario',config:h.firstUiChallenges[3].config,ok:false,output:'Resultado obtenido: 35000 COP',at:'2026-10-26T06:00:00Z'};assert.equal(h.controlledUiFailure(run),true);assert.equal(h.controlledUiFailure({...run,output:'No se pudo conectar'}),false);assert.equal(h.controlledUiFailure({...run,ok:true}),false);assert.equal(h.controlledUiFailure({...run,config:{...run.config,expected:'35000 COP'}}),false);assert.equal(h.observedUiTotal('sin resultado'),'');assert.equal(h.sameUiConfig(run.config,{...run.config}),true);assert.equal(h.sameUiConfig(run.config,{...run.config,quantity:'2'}),false);
});
test('UI evidence distinguishes generated spec from integrated execution and preserves controlled failure',()=>{
 const config=h.firstUiChallenges[4].config,run={mode:'scenario',config,source:h.uiSpec(config),ok:true,at:'2026-10-26T06:00:00Z',output:'Resultado obtenido: 35000 COP',uiFailure:{config:h.firstUiChallenges[3].config,output:'Then espero: 1 COP\nResultado obtenido: 35000 COP',at:'2026-10-26T05:59:00Z'}};
 const report=h.uiEvidence(run,['Given y locators','Fallo y retest','Comando pendiente'],['Escenario','Comparación','Externo']);for(const value of [run.source,run.output,run.uiFailure.output,'no demuestra por sí solo','Fallo controlado conservado'])assert.ok(report.includes(value));assert.ok(JSON.stringify({week:13,execution:run,fields:['x'.repeat(1000),'x'.repeat(1000),'x'.repeat(1000)]}).length<8000);
});
