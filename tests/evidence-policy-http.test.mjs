import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const require=createRequire(new URL('../apps/api/package.json',import.meta.url));
require('reflect-metadata');
const {NestFactory,APP_GUARD}=require('@nestjs/core'),{Module}=require('@nestjs/common');
const ts=require('typescript'),root=fileURLToPath(new URL('../apps/api/',import.meta.url)),cache=new Map();
function load(path){
 const file=resolve(root,path);if(cache.has(file))return cache.get(file).exports;
 const module={exports:{}};cache.set(file,module);
 const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,experimentalDecorators:true,emitDecoratorMetadata:true}}).outputText;
 new Function('require','module','exports',code)(id=>id.startsWith('.')?load(resolve(dirname(file),id+'.ts')):require(id),module,module.exports);
 return module.exports;
}
const {ProgressController}=load('src/presentation/controllers/progress.controller.ts');
const {PROGRESS_REPOSITORY}=load('src/application/tokens.ts');
const {OriginGuard,SessionGuard,RolesGuard,cookieName}=load('src/presentation/security/session-security.ts');
const {PostgresProgressAdapter}=load('src/infrastructure/adapters/postgres-progress.adapter.ts');
const {SecureAuthenticationService}=require('@qapath/identity');
const {applyProgressCommand,emptyProgress,fromUnknown}=require('@qapath/progress');

test('SPEC-110 HTTP preserves guards, error envelope, per-id limits and account isolation without a database',async t=>{
 process.env.WEB_ORIGIN='http://localhost:3000';
 const states=new Map();let mutations=0;
 const get=id=>structuredClone(states.get(id)||emptyProgress());
 const transact=async(id,change)=>{const next=change(get(id));states.set(id,next);mutations++;return structuredClone(next)};
 // Exercise the real import rule, replacing only its database transaction boundary.
 const importer=Object.create(PostgresProgressAdapter.prototype);importer.transact=(id,change)=>transact(id,change);
 const port={get:async id=>get(id),apply:(id,command)=>transact(id,current=>applyProgressCommand(current,command)),import:(id,previous)=>importer.import(id,previous)};
 const users={'student-a':{id:'account-a',role:'STUDENT'},'student-b':{id:'account-b',role:'STUDENT'},admin:{id:'admin',role:'ADMIN'},instructor:{id:'instructor',role:'INSTRUCTOR'}};
 class TestModule{}
 Module({controllers:[ProgressController],providers:[{provide:PROGRESS_REPOSITORY,useValue:port},{provide:SecureAuthenticationService,useValue:{findSession:async token=>users[token]||null}},{provide:APP_GUARD,useClass:OriginGuard},{provide:APP_GUARD,useClass:SessionGuard},{provide:APP_GUARD,useClass:RolesGuard}]})(TestModule);
 const app=await NestFactory.create(TestModule,{logger:false});app.setGlobalPrefix('api/v1');await app.listen(0,'127.0.0.1');t.after(()=>app.close());
 const base=(await app.getUrl())+'/api/v1/me/progress';
 const headers=(token='student-a',origin='http://localhost:3000')=>({'Content-Type':'application/json',Origin:origin,...(token?{Cookie:cookieName()+'='+token}:{})});
 const patch=(body,token='student-a',origin)=>fetch(base,{method:'PATCH',headers:headers(token,origin),body:JSON.stringify(body)});
 const body=(kind,id,length)=>({type:'submit-evidence',kind,id,text:'x'.repeat(length)});
 const invalid={message:'Cambio de progreso inválido.',error:'Bad Request',statusCode:400};

 await t.test('anonymous, wrong roles and cross-site requests never reach the write port',async()=>{
  const before=mutations;
  for(const [token,status]of [[null,401],['admin',403],['instructor',403]]){
   const response=await patch(body('exercise','23',8001),token);assert.equal(response.status,status);await response.arrayBuffer();
  }
  const response=await patch(body('exercise','23',8001),'student-a','https://untrusted.example.test');
  assert.equal(response.status,403);await response.arrayBuffer();assert.equal(mutations,before);
 });

 await t.test('all 24 ids retain the error shape and have exactly the approved boundaries',async()=>{
  const extended=[1,5,7,8,9,23,24];
  for(let week=1;week<=24;week++)for(const length of [39,40,8000,8001,32000,32001]){
   const limit=extended.includes(week)?32000:8000,before=mutations;
   const response=await patch(body('exercise',String(week),length));
   if(length>=40&&length<=limit){
    assert.equal(response.status,200,'week '+week+', '+length);
    const saved=(await response.json()).data;assert.equal(saved.evidence['exercise:'+week],'x'.repeat(length));assert.equal(mutations,before+1);
   }else{
    assert.equal(response.status,400);assert.deepEqual(await response.json(),invalid);assert.equal(mutations,before);
   }
  }
 });

 await t.test('non-exercise caps, strict payloads, unknown ids and trimming stay unchanged',async()=>{
  for(const [kind,id]of [['task','1:0'],['lab','l1'],['certification','ctfl-mock']]){
   const before=mutations,response=await patch(body(kind,id,8001));
   assert.equal(response.status,400);assert.deepEqual(await response.json(),invalid);assert.equal(mutations,before);
  }
  for(const payload of [{...body('exercise','23',40),userId:'account-b'},body('exercise','023',8001),{...body('exercise','23',40),text:'🧪'.repeat(16000)+'x'}]){
   const before=mutations,response=await patch(payload);assert.equal(response.status,400);assert.deepEqual(await response.json(),invalid);assert.equal(mutations,before);
  }
  const unknown=await patch(body('exercise','25',40));assert.equal(unknown.status,400);await unknown.arrayBuffer();
  const response=await patch({...body('exercise','22',8000),text:'  '+'x'.repeat(8000)+'  '});
  assert.equal(response.status,200);assert.equal((await response.json()).data.evidence['exercise:22'].length,8000);
 });

 await t.test('full 23/24 JSON reports survive readback and a failed update cannot replace them',async()=>{
  for(const week of [23,24]){
   const report={week,title:'Informe de prueba',completion:'draft',fields:['Conserva resultados','No cambia la calificación','Sin credenciales'],execution:{mode:week===24?'topic':'scenario',source:'Caso sintético',output:'Resultado observado',ok:false,at:'2026-10-26T12:00:00Z'},attachment:''};
   report.attachment='🧪'.repeat(Math.floor((32000-JSON.stringify(report).length)/2));
   if(JSON.stringify(report).length<32000)report.attachment+='x';
   const text=JSON.stringify(report);assert.equal(text.length,32000);
   const response=await patch({type:'submit-evidence',kind:'exercise',id:String(week),text});
   assert.equal(response.status,200);assert.equal((await response.json()).data.evidence['exercise:'+week],text);
   const failed=await patch(body('exercise',String(week),32001));assert.equal(failed.status,400);await failed.arrayBuffer();
   const read=await fetch(base,{headers:headers()});assert.equal((await read.json()).data.evidence['exercise:'+week],text);
   const other=await fetch(base,{headers:headers('student-b')});assert.equal((await other.json()).data.evidence['exercise:'+week],undefined);
  }
 });

 await t.test('real adapter import rule grants only notes, never imported evidence or grades',async()=>{
  const backup={...emptyProgress(),notes:{'1':'Nota importada de entrenamiento'},quizzes:{portafolio:100},evidence:{'exercise:23':'x'.repeat(32000)},final:[0]};
  const response=await fetch(base+'/import',{method:'POST',headers:headers('student-b'),body:JSON.stringify(backup)});
  assert.equal(response.status,201);
  const saved=(await response.json()).data;
  assert.equal(saved.notes['1'],backup.notes['1']);assert.deepEqual(saved.evidence,{});assert.deepEqual(saved.quizzes,{});assert.deepEqual(saved.final,[]);
  assert.deepEqual(fromUnknown(saved),saved);
 });
});

