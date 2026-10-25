import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {validatedPractice} from './helpers/practice-evidence.mjs';
const require=createRequire(import.meta.url),p=require('../libs/progress/dist/index.js'),{progressCommandSchema}=require('../packages/contracts/dist/index.js');
const closed=()=>JSON.parse(JSON.parse(validatedPractice(5)).execution.source);
test('bug lifecycle replays failed retest, reopening, correction, verification, regression and closure',()=>{
 const mission=closed(),assessment=p.assessBugMission(mission);assert.equal(assessment.complete,true);assert.deepEqual(assessment.retests.map(item=>item.observed),[195,150]);assert.equal(assessment.regression.observed,100);assert.equal(p.readBugMission(JSON.stringify(mission)).events.length,12);assert.ok(JSON.stringify(mission).length<6000);
});
test('reporting needs reproduction and concrete steps; transitions cannot skip verification',()=>{
 const mission=p.emptyBugMission();assert.throws(()=>p.advanceBugMission(mission,{action:'report',at:'2026-10-25'}),/Reproduce/);assert.throws(()=>p.advanceBugMission(mission,{action:'close',at:'2026-10-25'}),/estado/);assert.ok(p.bugReportErrors(mission.report).length>=6);
 const data=closed();data.events=data.events.filter(item=>item.action!=='retest');assert.equal(p.readBugMission(JSON.stringify(data)),null);
 const ready=closed();ready.events=ready.events.slice(0,10);assert.throws(()=>p.advanceBugMission(ready,{action:'close',at:'2026-10-25'}),/regresión/);assert.throws(()=>p.advanceBugMission(ready,{action:'regression',amount:100,expected:95,at:'2026-10-25'}),/predicción/);assert.throws(()=>p.advanceBugMission(ready,{action:'regression',amount:50,expected:150,at:'2026-10-25'}),/otro importe/);
});
test('drafts and early bug transitions do not complete practice; full reports and previous work survive serialization',()=>{
 const complete=JSON.parse(validatedPractice(5));const early={...complete,execution:{...complete.execution,source:JSON.stringify({...closed(),events:closed().events.slice(0,2)})}};assert.equal(p.practiceCompleted({'exercise:5':JSON.stringify(early)},5),false);assert.throws(()=>p.applyProgressCommand(p.emptyProgress(),{type:'submit-evidence',kind:'exercise',id:'5',text:JSON.stringify(early)}));
 const text=JSON.stringify({...complete,previousBugExecution:{source:'Trabajo anterior '+ 'x'.repeat(9000)}});assert.ok(text.length>8000);assert.equal(progressCommandSchema.safeParse({type:'submit-evidence',kind:'exercise',id:'5',text}).success,true);const state=p.applyProgressCommand(p.emptyProgress(),{type:'submit-evidence',kind:'exercise',id:'5',text});assert.equal(p.fromUnknown(JSON.parse(JSON.stringify(state))).evidence['exercise:5'],text);
 for(const source of ['null','{}','bad',JSON.stringify({...closed(),events:[{action:'assign',at:'bad',owner:[]}]})])assert.equal(p.readBugMission(source),null);
});
