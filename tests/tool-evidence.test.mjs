import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript'),module={exports:{}};
new Function('module','exports',ts.transpileModule(readFileSync(new URL('../apps/web/src/features/practice/tool-evidence.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(module,module.exports);
const {readToolRuns,mergeToolRun,buildToolEvidence,toolSnapshot}=module.exports;
const run=(mode,ok=true)=>({mode,ok,source:'Configuración de '+mode,output:'Resultado de '+mode,at:'2026-10-25T00:00:00Z',endpoint:mode==='http'?'/api/v1/practice/status/204':'',method:mode==='http'?'GET':'',expectedStatus:mode==='http'?204:0,config:{quantity:'1'}});
test('tool evidence merges three latest executions without duplicating the current one or hiding failed results',()=>{
 let runs={},execution;for(const mode of ['http','sql','git'])({runs,execution}=mergeToolRun(runs,run(mode)));assert.deepEqual(Object.keys(readToolRuns(execution)).sort(),['git','http','sql']);assert.equal(execution.toolRuns.git,undefined);
 const changed=mergeToolRun(runs,run('http',false));assert.equal(changed.runs.http.ok,false);assert.equal(changed.runs.sql.output,'Resultado de sql');assert.equal(changed.execution.toolRuns.http,undefined);
 const text=buildToolEvidence(changed.execution,['Mi análisis','',''],['API','SQL','Git']);assert.match(text,/Resultado de http/);assert.match(text,/Resultado de sql/);assert.doesNotMatch(text,/Resultado de git/);assert.match(text,/Resultado por revisar/);assert.match(text,/Mi análisis/);assert.match(text,/no demuestran una ejecución externa/);
});
test('tool snapshot restoration validates data and retains compatible legacy executions',()=>{
 assert.equal(readToolRuns(run('http')).http.expectedStatus,204);assert.deepEqual(readToolRuns(undefined),{});
 for(const patch of [{mode:'topic'},{source:'x'.repeat(6001)},{output:[]},{at:'bad'},{ok:'true'},{expectedStatus:NaN}])assert.equal(toolSnapshot({...run('http'),...patch}),null);
 assert.match(buildToolEvidence(undefined,[],[]),/Sin ejecución registrada/);
});
test('week seven evidence larger than 8k survives contract, domain and reload without changing other week limits',()=>{
 const p=require('../libs/progress/dist/index.js'),{progressCommandSchema}=require('../packages/contracts/dist/index.js');let runs={},execution;for(const mode of ['http','sql','git'])({runs,execution}=mergeToolRun(runs,{...run(mode),source:'x'.repeat(4000),output:'y'.repeat(2000)}));
 const text=JSON.stringify({week:7,completion:'draft',execution,fields:['Notas anteriores','','']});assert.ok(text.length>8000&&text.length<32000);const command={type:'submit-evidence',kind:'exercise',id:'7',text};assert.equal(progressCommandSchema.safeParse(command).success,true);const state=p.applyProgressCommand(p.emptyProgress(),command);assert.equal(p.fromUnknown(JSON.parse(JSON.stringify(state))).evidence['exercise:7'],text);assert.equal(progressCommandSchema.safeParse({...command,id:'10'}).success,false);
});

test('DevTools evidence retains a separate HTTP slot across save and reload',()=>{const first=mergeToolRun({},run('http'));const second=mergeToolRun(first.runs,{...run('http'),output:'Diagnóstico DevTools'},'devtools');const restored=readToolRuns(JSON.parse(JSON.stringify(second.execution)));assert.equal(restored.http.output,'Resultado de http');assert.equal(restored.devtools.output,'Diagnóstico DevTools');assert.match(buildToolEvidence(second.execution,[],[]),/Diagnóstico DevTools/);});
