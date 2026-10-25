import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript'),module={exports:{}};
new Function('module','exports',ts.transpileModule(readFileSync(new URL('../apps/web/src/features/practice/risk-mission.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(module,module.exports);
const {defaultRiskMission,rankedRisks,assessRiskMission,restoreRiskMission}=module.exports;
const complete=()=>({...defaultRiskMission(),priorities:['payment','stock'],levels:{calculation:'component',collaboration:'integration',journey:'system',business:'acceptance'}});
test('risk ranking reacts to probabilities, impacts and estimated mitigation without mutating the starting scores',()=>{
 const mission=defaultRiskMission();assert.deepEqual(rankedRisks(mission).map(r=>r.score),[20,12,6]);mission.risks.payment.mitigated=true;assert.equal(rankedRisks(mission)[0].id,'stock');assert.equal(mission.risks.payment.probability,4);mission.risks.payment.probability=1;assert.equal(rankedRisks(mission).find(r=>r.id==='payment').effectiveProbability,1);
});
test('two slots must cover the highest exposures; cutoff ties accept either equally ranked risk',()=>{
 const mission=complete();assert.equal(assessRiskMission(mission).ok,true);mission.risks.profile={probability:4,impact:3,mitigated:false};mission.priorities=['payment','profile'];assert.equal(assessRiskMission(mission).priorityOk,true);mission.priorities=['stock','profile'];assert.equal(assessRiskMission(mission).priorityOk,false);mission.priorities=['payment','payment'];assert.equal(assessRiskMission(mission).priorityOk,false);
});
test('feedback checks four distinct levels and restoring evidence filters invalid data',()=>{
 const mission=complete();mission.levels.calculation='system';assert.equal(assessRiskMission(mission).score,4);assert.equal(assessRiskMission(defaultRiskMission()).score,0);assert.deepEqual(restoreRiskMission(JSON.stringify(complete())),complete());
 const restored=restoreRiskMission(JSON.stringify({riskMissionVersion:1,risks:{payment:{probability:99,impact:-2,mitigated:true}},priorities:['bad','payment','payment'],levels:{calculation:'nonsense'}}));assert.equal(restored.risks.payment.probability,4);assert.deepEqual(restored.priorities,['payment']);assert.equal(restored.levels.calculation,undefined);
});
