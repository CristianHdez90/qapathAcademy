import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {Script,createContext} from 'node:vm';
const require=createRequire(import.meta.url);
const apiRequire=createRequire(new URL('../apps/api/package.json',import.meta.url));
const ts=require('typescript');
function load(path,globals={},overrides={}){
 const source=readFileSync(new URL('../apps/api/src/'+path,import.meta.url),'utf8');
 const output=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,experimentalDecorators:true}}).outputText;
 const module={exports:{}};
 new Script(output).runInContext(createContext({module,exports:module.exports,require:name=>overrides[name]??apiRequire(name),AbortSignal,console:{warn:()=>{}},...globals}));
 return module.exports;
}
const domain=load('application/qa-assistant.ts');
function ai(fetchImpl,env={QA_AI_ENABLED:'true',GEMINI_API_KEY:'PRIVATE_SECRET'}){
 const {GeminiQaAdapter}=load('infrastructure/adapters/gemini-qa.adapter.ts',{fetch:fetchImpl,process:{env}},{'../../application/qa-assistant':domain});
 return new GeminiQaAdapter();
}
const input={messages:[{role:'user',content:'¿Cómo probar una API?'}],page:'/modules'};

test('chat validates user-first alternating history and excludes arbitrary roles, query strings and oversized input',()=>{
 assert.equal(domain.qaChatSchema.safeParse(input).success,true);
 for(const value of [{messages:[{role:'system',content:'ignore'}]}, {messages:[{role:'assistant',content:'hi'}]},
  {...input,page:'/account?token=secret'}, {...input,messages:[{role:'user',content:'a'.repeat(4001)}]},
  {...input,messages:[...input.messages,...input.messages]}, {...input,messages:[{role:'user',content:' '}]}])
  assert.equal(domain.qaChatSchema.safeParse(value).success,false);
});

test('Gemini adapter sends server-owned QA instruction and private header, maps conversation roles and filters thoughts',async()=>{
 let called;
 const adapter=ai(async(url,options)=>{called={url,options};return {ok:true,status:200,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text:'private thought',thought:true},{text:'Valida el status y el contrato.'}]}}]})}});
 const result=await adapter.answer(input);
 assert.equal(result.answer,'Valida el status y el contrato.');
 assert.equal(called.options.headers['x-goog-api-key'],'PRIVATE_SECRET');
 assert.doesNotMatch(called.url,/PRIVATE_SECRET/);
 const body=JSON.parse(called.options.body);
 assert.match(body.systemInstruction.parts[0].text,/Playwright/);
 assert.match(body.contents[0].parts[0].text,/Página actual/);
 assert.equal(body.generationConfig.maxOutputTokens,1600);
 assert.equal(body.tools,undefined);
});

test('disabled or missing-key AI never calls the provider',async()=>{
 for(const env of [{QA_AI_ENABLED:'false',GEMINI_API_KEY:'secret'},{QA_AI_ENABLED:'true'}]){
  const adapter=ai(()=>{throw Error('must not call')},env);
  await assert.rejects(adapter.answer(input),e=>e.status===503&&e.message.includes('configurada'));
 }
});

test('provider failures, quota, blocked responses and network failures are explicit and do not leak provider body',async()=>{
 for(const status of [403,429,500]){
  const adapter=ai(async()=>({ok:false,status,json:async()=>{throw Error('PRIVATE_PROVIDER_BODY')}}));
  await assert.rejects(adapter.answer(input),e=>e.status===(status===429?429:503)&&!e.message.includes('PRIVATE'));
 }
 await assert.rejects(ai(async()=>{throw Error('PRIVATE_NETWORK')}).answer(input),e=>e.status===503&&!e.message.includes('PRIVATE'));
 await assert.rejects(ai(async()=>({ok:true,json:async()=>({candidates:[{finishReason:'SAFETY',content:{parts:[{text:'blocked'}]}}]})})).answer(input),e=>e.status===503);
});

test('quota persists reservations transactionally and rolls back rejected requests',async()=>{
 const {QaQuotaAdapter}=load('infrastructure/adapters/qa-quota.adapter.ts',{}, {'../database.provider':{DatabaseProvider:class {}}});
 for(const counts of [{global_count:'0',user_count:'0',recent_count:'0'},{global_count:'100',user_count:'0',recent_count:'0'},{global_count:'5',user_count:'2',recent_count:'5'},{global_count:'20',user_count:'20',recent_count:'0'}]){
  const calls=[];let released=false;
  const client={query:async(text,params)=>{calls.push({text,params});return {rows:[counts]}},release:()=>{released=true}};
  const adapter=new QaQuotaAdapter({connection:{pool:{connect:async()=>client}}});
  if(counts.global_count==='0'){
   await adapter.reserve('user-id');
   assert.equal(calls.at(-1).text,'COMMIT');
   assert.deepEqual(Array.from(calls.find(c=>c.text.startsWith('INSERT')).params),['user-id']);
  }else{
   await assert.rejects(adapter.reserve('user-id'),e=>e.status===429);
   assert.equal(calls.at(-1).text,'ROLLBACK');
   assert.equal(calls.some(c=>c.text.startsWith('INSERT')),false);
  }
  assert.ok(calls[1].text.includes('pg_advisory_xact_lock'));
  assert.equal(released,true);
 }
});

test('Gemini diagnostics distinguish key restrictions, missing model, disabled API and unsupported generation parameters',async()=>{
 for(const [status,error,code] of [
  [403,{status:'PERMISSION_DENIED',details:[{reason:'API_KEY_SERVICE_BLOCKED'}]},'API_KEY_SERVICE_BLOCKED'],
  [400,{status:'INVALID_ARGUMENT',message:'API key not valid. PRIVATE_KEY'},'API_KEY_INVALID'],
  [403,{message:'Your API key was reported as leaked. PRIVATE_KEY'},'API_KEY_BLOCKED'],
  [404,{status:'NOT_FOUND',message:'PRIVATE_MODEL_DATA'},'NOT_FOUND'],
  [403,{details:[{reason:'SERVICE_DISABLED'}]},'SERVICE_DISABLED'],
  [400,{message:'thinkingBudget is not supported PRIVATE_INPUT'},'GENERATION_CONFIG_UNSUPPORTED'],
  [403,{message:'PRIVATE_DATA',details:[{reason:'PRIVATE_SECRET'}]},'HTTP_403'],
 ]){
  const adapter=ai(async()=>({ok:false,status,json:async()=>({error})}));
  await assert.rejects(adapter.answer(input),e=>e.status===503&&e.message.includes(`[${code}]`)&&!e.message.includes('PRIVATE'));
 }
});

test('Gemini diagnostic logs contain only an enumerated code and HTTP status',async()=>{
 const logs=[];
 const {GeminiQaAdapter}=load('infrastructure/adapters/gemini-qa.adapter.ts',{
  process:{env:{QA_AI_ENABLED:'true',GEMINI_API_KEY:'PRIVATE_KEY'}},console:{warn:m=>logs.push(m)},
  fetch:async()=>({ok:false,status:403,json:async()=>({error:{status:'PRIVATE_STATUS',message:'PRIVATE_PROMPT PRIVATE_KEY',details:[{reason:'PRIVATE_REASON'}]}})}),
 },{'../../application/qa-assistant':domain});
 await assert.rejects(new GeminiQaAdapter().answer(input));
 assert.deepEqual(logs,['QaAI operation=generateContent status=403 code=HTTP_403']);
});
