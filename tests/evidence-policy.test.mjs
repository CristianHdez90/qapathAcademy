import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
const {evidenceTextLimit,emptyProgress,applyProgressCommand,fromUnknown,practiceCompleted,progressPercentage,weekRequirements}=require('../libs/progress/dist/index.js');
const {progressCommandSchema}=require('../packages/contracts/dist/index.js');

function report(week,length,completion='draft'){
 const value={week,title:'Evidencia sintética',completion,fields:['Reglas y límites','Resultados completos','Sin datos personales'],execution:{mode:week===24?'topic':'scenario',source:'Caso de entrenamiento',output:'Resultado conservado íntegro',ok:true,at:'2026-10-26T12:00:00Z'},attachment:''};
 const remaining=length-JSON.stringify(value).length;
 assert.ok(remaining>=0);
 value.attachment='á'.repeat(remaining);
 const text=JSON.stringify(value);
 assert.equal(text.length,length);
 return text;
}
const submit=(kind,id,text)=>({type:'submit-evidence',kind,id,text});

test('all 24 exercise limits agree in commands and persisted reads at every boundary',()=>{
 const extended=[1,5,7,8,9,23,24];
 for(let week=1;week<=24;week++){
  const id=String(week),limit=extended.includes(week)?32000:8000;
  assert.equal(evidenceTextLimit('exercise',id),limit);
  for(const length of [39,40,7999,8000,8001,31999,32000,32001]){
   const text='x'.repeat(length),command=submit('exercise',id,text),current=emptyProgress();
   const accepted=length>=40&&length<=limit;
   if(accepted){
    const saved=applyProgressCommand(current,command);
    assert.equal(saved.evidence['exercise:'+id],text,'week '+id+', '+length);
    assert.equal(fromUnknown(JSON.parse(JSON.stringify(saved))).evidence['exercise:'+id],text);
   }else{
    assert.throws(()=>applyProgressCommand(current,command),/Evidencia inválida/);
    assert.deepEqual(current,emptyProgress());
   }
   const read=fromUnknown({...emptyProgress(),evidence:{['exercise:'+id]:text}});
   assert.equal(read.evidence['exercise:'+id],accepted?text:undefined);
  }
 }
});

test('task, lab and certification remain limited to 8000 even with extended exercise ids',()=>{
 const entries=[['task','1:0'],['lab',weekRequirements(1).labs[0]],['certification','ctfl-mock']];
 for(const [kind,id] of entries){
  assert.equal(evidenceTextLimit(kind,id),8000);
  const saved=applyProgressCommand(emptyProgress(),submit(kind,id,'x'.repeat(8000)));
  assert.equal(saved.evidence[kind+':'+id].length,8000);
  assert.throws(()=>applyProgressCommand(saved,submit(kind,id,'x'.repeat(8001))),/Evidencia inválida/);
  assert.equal(saved.evidence[kind+':'+id].length,8000);
 }
 for(const kind of ['task','lab','certification','unknown'])assert.equal(evidenceTextLimit(kind,'23'),8000);
});

test('full draft and validated reports for 23 and 24 survive serialized round trips without changing credit rules',()=>{
 for(const week of [23,24])for(const length of [8001,32000])for(const completion of ['draft','validated']){
  const text=report(week,length,completion);
  const saved=applyProgressCommand(emptyProgress(),submit('exercise',String(week),text));
  const restored=fromUnknown(JSON.parse(JSON.stringify(saved)));
  assert.equal(restored.evidence['exercise:'+week],text);
  assert.deepEqual(JSON.parse(restored.evidence['exercise:'+week]),JSON.parse(text));
  assert.equal(practiceCompleted(restored.evidence,week),completion==='validated');
  assert.equal(progressPercentage(restored,[week]),completion==='validated'?25:0);
 }
});

test('noncanonical evidence keys retain their old default cap and cannot borrow an extended exercise limit',()=>{
 for(const key of ['exercise:023','exercise:23:extra','exercise:24:','unknown:23','exercise23','task:23','EXERCISE:23']){
  assert.equal(fromUnknown({...emptyProgress(),evidence:{[key]:'x'.repeat(8000)}}).evidence[key].length,8000);
  assert.equal(fromUnknown({...emptyProgress(),evidence:{[key]:'x'.repeat(8001)}}).evidence[key],undefined);
 }
 assert.throws(()=>applyProgressCommand(emptyProgress(),submit('exercise','25','x'.repeat(40))),/Evidencia inválida/);
 assert.throws(()=>applyProgressCommand(emptyProgress(),submit('exercise','023','x'.repeat(40))),/Evidencia inválida/);
});

test('notes and normalization rules retain independent limits and preserve whitespace behavior',()=>{
 const text=' '+ 'x'.repeat(8000)+' ';
 assert.throws(()=>applyProgressCommand(emptyProgress(),submit('exercise','22',text)),/Evidencia inválida/);
 const parsed=progressCommandSchema.parse(submit('exercise','22',text));
 assert.equal(parsed.text,'x'.repeat(8000));
 assert.equal(applyProgressCommand(emptyProgress(),parsed).evidence['exercise:22'],parsed.text);
 assert.throws(()=>applyProgressCommand(emptyProgress(),submit('exercise','23',' '.repeat(40))),/Evidencia inválida/);
 const notes={'1':'n'.repeat(8000),'exercise:23':'n'.repeat(8001)};
 assert.deepEqual(fromUnknown({...emptyProgress(),notes}).notes,{'1':notes['1']});
 assert.throws(()=>applyProgressCommand(emptyProgress(),{type:'note',week:1,text:'n'.repeat(8001)}),/Nota inválida/);
});

test('UTF-16 length and structural contract boundaries are unchanged',()=>{
 const text='🧪'.repeat(16000);
 assert.equal(text.length,32000);
 const saved=applyProgressCommand(emptyProgress(),submit('exercise','23',text));
 assert.equal(fromUnknown(saved).evidence['exercise:23'],text);
 assert.throws(()=>applyProgressCommand(saved,submit('exercise','23',text+'x')),/Evidencia inválida/);
 assert.equal(progressCommandSchema.safeParse(submit('exercise','23',text)).success,true);
 // Zod 4 counts code points; the semantic policy still enforces UTF-16 units.
 assert.equal(progressCommandSchema.safeParse(submit('exercise','23',text+'x')).success,true);
 for(const body of [submit('exercise','23','x'.repeat(32001)),submit('exercise','23','x'.repeat(39)),{...submit('exercise','23','x'.repeat(40)),userId:'other'}]){
  assert.equal(progressCommandSchema.safeParse(body).success,false);
 }
});

test('a compatible rollback can pause large writes while keeping previously saved 23/24 evidence readable',()=>{
 const text=report(23,32000);
 let state=applyProgressCommand(emptyProgress(),submit('exercise','23',text));
 // A temporary rollback writer with the old cap must reject, never overwrite or truncate.
 const pausedWrite=command=>{
  if(command.type==='submit-evidence'&&command.text.length>8000)throw new Error('Escrituras largas pausadas');
  state=applyProgressCommand(state,command);
 };
 assert.throws(()=>pausedWrite(submit('exercise','23',report(23,8001))),/pausadas/);
 state=applyProgressCommand(state,{type:'note',week:1,text:'La lectura compatible conserva el expediente completo.'});
 assert.equal(fromUnknown(JSON.parse(JSON.stringify(state))).evidence['exercise:23'],text);
});

