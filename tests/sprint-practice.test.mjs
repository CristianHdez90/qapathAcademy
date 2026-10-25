import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {validatedPractice} from './helpers/practice-evidence.mjs';
const require=createRequire(import.meta.url),p=require('../libs/progress/dist/index.js');
const complete=()=>JSON.parse(JSON.parse(validatedPractice(6)).execution.source);
test('Sprint metrics distinguish executed, blocked, remaining and zero denominators',()=>{
 const base=p.emptySprintPractice(),m=p.sprintMetrics(base);assert.equal(m.executed,19);assert.equal(m.remaining,5);assert.equal(m.execution,76);assert.equal(m.approval,89);assert.equal(m.done,false);
 const zero={...base,passed:0,failed:0,blocked:1};assert.equal(p.sprintMetrics(zero).approval,null);assert.equal(p.sprintMetrics(zero).execution,0);
 for(const patch of [{planned:0},{passed:26},{blocked:-1},{failed:1.5},{passed:NaN},{planned:101}])assert.equal(p.sprintMetrics({...base,...patch}).valid,false);
});
test('Sprint completion requires event understanding, correct predictions, DoD and process improvement',()=>{
 const data=complete();assert.equal(p.assessSprintPractice(data).complete,true);assert.equal(p.practiceCompleted({'exercise:6':validatedPractice(6)},6),true);
 for(const patch of [{goal:''},{events:{...data.events,results:'retro'}},{predictedExecuted:'20'},{predictedApproval:'68'},{dod:'done'},{improvement:'skip-tests'}])assert.equal(p.assessSprintPractice({...data,...patch}).complete,false);
 const allPassed={...data,passed:25,failed:0,blocked:0,predictedExecuted:'25',predictedApproval:'100',dod:'done'};assert.equal(p.assessSprintPractice(allPassed).complete,true);
 const zero={...data,passed:0,failed:0,predictedExecuted:'0',predictedApproval:'na'};assert.equal(p.assessSprintPractice(zero).complete,true);assert.equal(p.assessSprintPractice({...zero,predictedApproval:'0'}).complete,false);
});
test('Sprint drafts and malformed snapshots cannot award practice credit',()=>{
 const record=JSON.parse(validatedPractice(6));delete record.execution.ok;assert.equal(p.practiceCompleted({'exercise:6':JSON.stringify(record)},6),false);
 const data=complete();delete data.validatedAt;record.execution.ok=true;record.execution.source=JSON.stringify(data);assert.equal(p.practiceCompleted({'exercise:6':JSON.stringify(record)},6),false);
 for(const source of ['null','{}','bad',JSON.stringify({...complete(),events:[]}),JSON.stringify({...complete(),validatedAt:'bad'}),JSON.stringify({...complete(),goal:'x'.repeat(201)})])assert.equal(p.readSprintPractice(source),null);
 const legacy=JSON.stringify({week:6,completion:'draft',fields:['Mi objetivo anterior','',''],caseMatrix:[{id:'OLD',title:'Caso anterior'}],previousSprintExecution:{output:'Resultado anterior'}});const state=p.applyProgressCommand(p.emptyProgress(),{type:'submit-evidence',kind:'exercise',id:'6',text:legacy});assert.equal(p.fromUnknown(state).evidence['exercise:6'],legacy);
});
