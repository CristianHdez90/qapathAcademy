import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
function load(file,dependencies={}){const module={exports:{}};new Function('module','exports','require',ts.transpileModule(readFileSync(new URL(`../apps/web/src/features/practice/${file}.ts`,import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText)(module,module.exports,id=>dependencies[id]);return module.exports}
const model=load('gherkin-lab'),evidence=load('gherkin-evidence',{'./gherkin-lab':model});
test('saved Gherkin selections are restored without fabricating missing or malformed steps',()=>{
 for(const source of ['null','{}','bad',JSON.stringify({gherkinVersion:1,title:'Incompleto'})])assert.equal(model.readGherkinSelection(source),null);
 assert.deepEqual(model.readGherkinSelection(JSON.stringify({gherkinVersion:1,...model.gherkinExample})),model.gherkinExample);assert.equal(model.gherkinCriterion({...model.gherkinExample,given:'active-invalid'}),'CA-02');assert.equal(model.gherkinCriterion({...model.gherkinExample,given:'inactive-valid'}),'CA-03');
});
test('evidence report exports executed steps, acceptance criterion, observed result and partial reflections',()=>{
 const execution={source:JSON.stringify({gherkinVersion:1,...model.gherkinExample,given:'active-invalid',then:'invalid-credentials'}),at:'2026-10-25T00:00:00Z'};const text=evidence.buildGherkinEvidenceMarkdown(execution,['Mi escenario comprueba CA-02','',''],['Criterio','Roles','Conclusión']);assert.match(text,/CA-02/);assert.match(text,/```gherkin/);assert.match(text,/Then veo el mensaje Credenciales incorrectas/);assert.match(text,/Resultado obtenido \(simulador\): Mensaje Credenciales incorrectas/);assert.match(text,/Mi escenario comprueba/);assert.match(text,/Sin respuesta todavía/);assert.match(text,/2026-10-25/);assert.match(text,/No ejecuta Cucumber/);
});
test('incoherent scenarios retain their errors in the report and absent executions remain a draft',()=>{
 const execution={source:JSON.stringify({gherkinVersion:1,...model.gherkinExample,given:'active-invalid'}),at:'2026-10-25T00:00:00Z'};assert.match(evidence.buildGherkinEvidenceMarkdown(execution,[],[]),/contradice CA-02/);assert.equal(evidence.gherkinEvidenceSnapshot({source:'{}',at:''}),null);assert.match(evidence.buildGherkinEvidenceMarkdown(undefined,[],[]),/Todavía no hay un escenario/);
});
