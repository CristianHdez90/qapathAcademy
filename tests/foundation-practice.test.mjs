import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {foundationExamples,caseFingerprint,executeTransfer,validateFoundationPractice,assessFoundationEvidence,applyProgressCommand,emptyProgress,fromUnknown}=require('../libs/progress/dist/index.js');
function cases(){return foundationExamples.map((example,i)=>{const row={id:`TC-${i+1}`,exampleId:example.id,criterion:example.criterion,title:example.technique,preconditions:'Cuenta preparada con datos ficticios',data:JSON.stringify(example.data),steps:example.steps.map((s,i)=>`${i+1}. ${s}`).join('\n'),expected:example.expected,observed:example.expected,status:'Aprobado',bug:''};row.execution={fingerprint:caseFingerprint(row),obtained:executeTransfer(example.data).outcome};return row})}
test('five techniques need complete executed cases, with distinct IDs and sequential steps',()=>{
 const rows=cases();assert.equal(validateFoundationPractice(rows).complete,true);assert.equal(validateFoundationPractice(rows.slice(1)).complete,false);
 rows[0].steps='Given una cuenta\nWhen transfiero\nThen saldo correcto';assert.equal(validateFoundationPractice(rows).complete,false);
 rows[0]=cases()[0];rows[1].id=rows[0].id;assert.equal(validateFoundationPractice(rows).complete,false);
});
test('changing a definition invalidates execution, and failed cases require a bug',()=>{
 const rows=cases();rows[0].title+=' cambiado';assert.equal(validateFoundationPractice(rows).complete,false);
 rows[0]=cases()[0];rows[0].observed=executeTransfer(foundationExamples[0].data,true).outcome;rows[0].status='Fallido';rows[0].execution={fingerprint:caseFingerprint(rows[0]),obtained:rows[0].observed,defect:true};assert.equal(validateFoundationPractice(rows).complete,false);rows[0].bug='BUG-01 resta 5 en vez de 50';assert.equal(validateFoundationPractice(rows).complete,true);
 rows[0].observed='Saldo 123; aceptada';assert.equal(validateFoundationPractice(rows).complete,false);
});
test('validated evidence is checked in domain, drafts remain editable and long matrix survives reload',()=>{
 const rows=cases();const text=JSON.stringify({caseMatrix:rows,completion:'validated',notes:'x'.repeat(9000)});assert.ok(text.length>8000);assert.equal(assessFoundationEvidence(text).complete,true);
 const command={type:'submit-evidence',kind:'exercise',id:'1',text};const saved=applyProgressCommand(emptyProgress(),command);assert.equal(fromUnknown(saved).evidence['exercise:1'],text);
 assert.throws(()=>applyProgressCommand(emptyProgress(),{...command,text:JSON.stringify({completion:'validated',caseMatrix:rows.slice(1)})}));
 assert.doesNotThrow(()=>applyProgressCommand(emptyProgress(),{...command,text:JSON.stringify({completion:'draft',caseMatrix:rows.slice(1)})}));
 assert.throws(()=>applyProgressCommand(emptyProgress(),{...command,id:'2'}));assert.equal(assessFoundationEvidence('{bad').complete,false);
});
