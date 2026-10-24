import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {Pool}=require('../packages/database/node_modules/pg');
let local=false;
try{const url=new URL(process.env.DATABASE_URL);local=['localhost','127.0.0.1','[::1]'].includes(url.hostname)&&/^\/qapath_firebase_test_[a-f0-9]{12}$/.test(url.pathname)}catch{}

test('saved QA conversations preserve complete transcripts, isolate owners, archive and reject conflicting edits',{skip:!local},async()=>{
 const pool=new Pool({connectionString:process.env.DATABASE_URL,max:2});
 const {QaConversationsAdapter}=require('../apps/api/dist/infrastructure/adapters/qa-conversations.adapter');
 const {QaAssistantController}=require('../apps/api/dist/presentation/controllers/qa-assistant.controller');
 try{
  const {rows:users}=await pool.query("INSERT INTO users(email,password_hash) VALUES('qa-history-a@example.test','unused'),('qa-history-b@example.test','unused') RETURNING id");
  const [a,b]=users.map(u=>u.id);const store=new QaConversationsAdapter({connection:{pool}});
  let context;const ai={configuration(){},async answer(input){context=input;return {answer:'Respuesta guardada de Lía'}}};
  const controller=new QaAssistantController(ai,{async reserve(){}},store);
  let result=await controller.chat({keepHistory:true,messages:[{role:'user',content:'Pregunta inicial'}]},{user:{id:a}});
  const id=result.data.conversation.id;
  for(let i=1;i<5;i++)result=await controller.chat({keepHistory:true,conversationId:id,revision:result.data.conversation.revision,messages:[{role:'user',content:'Nueva pregunta '+i}]},{user:{id:a}});
  assert.equal((await store.get(a,id)).messages.length,10);
  assert.equal((await store.get(a,id)).messages[0].content,'Pregunta inicial');
  assert.equal(context.messages.length,5,'Provider receives bounded stored context');
  assert.equal(context.messages[0].content,'Nueva pregunta 2');
  await assert.rejects(store.get(b,id),e=>e.getStatus()===404);
  await assert.rejects(store.archive(b,id,true),e=>e.getStatus()===404);
  assert.equal((await store.list(b)).items.length,0);
  const current=await store.get(a,id);
  await store.append(a,current,'Pregunta concurrente','Primera respuesta');
  await assert.rejects(store.append(a,current,'Pregunta concurrente','Segunda respuesta'),e=>e.getStatus()===409);
  const archived=await store.archive(a,id,true);
  assert.equal(archived.archived,true);assert.equal(archived.messages.length,12);
  await assert.rejects(store.prepare(a,'Intento',id,archived.revision),e=>e.getStatus()===409);
  const restored=await store.archive(a,id,false);assert.equal(restored.archived,false);
  await assert.rejects(store.prepare(a,'Intento',id,current.revision),e=>e.getStatus()===409);
  const failed=new QaAssistantController({configuration(){},async answer(){throw new Error('Gemini temporalmente inaccesible')}},{async reserve(){}},store);
  await assert.rejects(failed.chat({keepHistory:true,conversationId:id,revision:restored.revision,messages:[{role:'user',content:'No guardar respuesta fallida'}]},{user:{id:a}}));
  assert.equal((await store.get(a,id)).revision,restored.revision);
  assert.equal((await store.get(a,id)).messages.length,12);
  const beforeFailure=(await store.list(a)).items.length;
  await assert.rejects(failed.chat({keepHistory:true,messages:[{role:'user',content:'Nueva consulta fallida'}]},{user:{id:a}}));
  assert.equal((await store.list(a)).items.length,beforeFailure,'Failed new chats do not create empty history entries');
  const full=Array.from({length:200},(_,i)=>({role:i%2?'assistant':'user',content:'Mensaje '+i}));
  await pool.query('UPDATE qa_conversations SET messages=$1::jsonb WHERE id=$2',[JSON.stringify(full),id]);
  await assert.rejects(store.prepare(a,'Más mensajes',id,restored.revision),e=>e.getStatus()===409);
  await pool.query("INSERT INTO qa_conversations(user_id,title) SELECT $1,'Conversación '||n FROM generate_series(1,51) n",[a]);
  const page=await store.list(a);assert.equal(page.items.length,50);assert.equal(page.nextOffset,50);assert.equal('messages' in page.items[0],false);
  assert.equal((await store.list(a,50)).items.length,2);
  await pool.query('DELETE FROM users WHERE id=ANY($1::uuid[])',[[a,b]]);
  assert.equal((await pool.query('SELECT count(*) FROM qa_conversations WHERE user_id=$1',[a])).rows[0].count,'0');
 }finally{await pool.end()}
});
