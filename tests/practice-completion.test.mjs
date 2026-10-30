import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {validatedPractice} from './helpers/practice-evidence.mjs';
const require=createRequire(import.meta.url),{practiceCompleted,applyProgressCommand,emptyProgress,progressPercentage}=require('../libs/progress/dist/index.js');
test('all 24 activities complete only from validated exercise evidence',()=>{
 for(let week=1;week<=24;week++){const text=validatedPractice(week);const state=applyProgressCommand(emptyProgress(),{type:'submit-evidence',kind:'exercise',id:String(week),text});assert.equal(practiceCompleted(state.evidence,week),true,`week ${week}`);// Fundamentos v2 (semanas 1–2) tiene tres etapas: tarjetas, minitests y práctica.
assert.equal(progressPercentage(state,[week]),week<=2?33.3:25);const draft=JSON.stringify({...JSON.parse(text),completion:'draft'});assert.equal(practiceCompleted({[`exercise:${week}`]:draft},week),false)}
});
test('notes, legacy tasks/labs, failed runs and a bare completion flag cannot award practice credit',()=>{
 const legacy={...emptyProgress(),evidence:{'task:2:0':'x'.repeat(80),'lab:l1':'x'.repeat(80),'exercise:2':'x'.repeat(80)}};assert.equal(progressPercentage(legacy,[2]),0);
 for(const change of [{execution:undefined},{execution:{ok:true}},{week:3},{execution:{...JSON.parse(validatedPractice(2)).execution,ok:false}},{execution:{...JSON.parse(validatedPractice(2)).execution,mode:'code'}}]){const text=JSON.stringify({...JSON.parse(validatedPractice(2)),notes:'Evidencia de entrenamiento para validar la actividad.',...change});assert.throws(()=>applyProgressCommand(emptyProgress(),{type:'submit-evidence',kind:'exercise',id:'2',text}),/actividad/)}
});
