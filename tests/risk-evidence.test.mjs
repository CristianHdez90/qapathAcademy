import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
function load(name,dependencies={}){const module={exports:{}};new Function('module','exports','require',ts.transpileModule(readFileSync(new URL(`../apps/web/src/features/practice/${name}.ts`,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(module,module.exports,id=>dependencies[id]);return module.exports}
const mission=load('risk-mission'),{riskEvidenceSnapshot,buildRiskEvidenceMarkdown}=load('risk-evidence',{'./risk-mission':mission});
test('risk evidence does not invent a strategy for absent, legacy or malformed runs',()=>{
 for(const execution of [undefined,{mode:'topic',source:'{}'},{mode:'topic',source:'null'},{mode:'topic',source:'bad'},{mode:'topic',source:JSON.stringify({riskMissionVersion:1,risks:{}})}])assert.equal(riskEvidenceSnapshot(execution),null);
});
test('risk evidence exports the actual simulation and preserves incomplete reflections',()=>{
 const source=mission.defaultRiskMission();source.risks.stock.mitigated=true;source.priorities=['payment','profile'];
 const snapshot=riskEvidenceSnapshot({mode:'topic',source:JSON.stringify(source),at:'2026-10-25T00:00:00Z'});
 assert.deepEqual(snapshot.priorities.map(r=>r.id),['payment','profile']);assert.equal(snapshot.mitigations[0].score,4);
 const markdown=buildRiskEvidenceMarkdown(snapshot,['Mi estimación usa el impacto financiero.','',''],['Estimación','Prioridad','Mitigación']);
 assert.match(markdown,/12 → 4/);assert.match(markdown,/Mi estimación usa el impacto financiero/);assert.match(markdown,/Sin respuesta todavía/);assert.match(markdown,/no prueban una reducción real/);
});
