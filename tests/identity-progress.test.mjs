import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {AuthenticationService,AuthError,AuthConflict,canManageUsers,canManageContent}=require('../libs/identity/dist/index.js');
const {applyProgressCommand,mergeProgress,emptyProgress}=require('../libs/progress/dist/index.js');
test('Registro público siempre usa rol STUDENT y evita duplicados',async()=>{
 const byEmail=new Map();let id=0;
 const adapter={findByEmail:async e=>byEmail.get(e)||null,create:async d=>{const u={...d,id:String(++id),failedAttempts:0,lockedUntil:null,isActive:true};byEmail.set(d.email,u);return u;},recordFailure:async()=>{},resetFailures:async()=>{}};
 const auth=new AuthenticationService({users:adapter,passwords:{hash:async p=>'hash:'+p,verify:async(p,h)=>h==='hash:'+p},sessions:{create:async()=>{},findUserByTokenHash:async()=>null,revoke:async()=>{}},tokens:{issue:()=> 'test-token',hash:x=>x}});
 const created=await auth.signUp(' ALUMNO@EJEMPLO.COM ','mipassword12345');
 assert.equal(created.role,'STUDENT');assert.equal(created.email,'alumno@ejemplo.com');
 await assert.rejects(auth.signUp('alumno@ejemplo.com','otraclave-1234'),AuthConflict);
 assert.equal(canManageUsers('STUDENT'),false);assert.equal(canManageContent('INSTRUCTOR'),true);
 await assert.rejects(auth.signIn('alumno@ejemplo.com','incorrecta'),AuthError);
 byEmail.get('alumno@ejemplo.com').isActive=false;
 await assert.rejects(auth.signIn('alumno@ejemplo.com','mipassword12345'),AuthError);
});
test('Operaciones de progreso mantienen datos entre actualizaciones',()=>{
 let current=emptyProgress();
 current=applyProgressCommand(current,{type:'reading-section',week:1,section:0});
 current=applyProgressCommand(current,{type:'note',week:1,text:'Mi resumen'});
 current=applyProgressCommand(current,{type:'reading-section',week:1,section:1});
 assert.deepEqual(current.weeks,[]);assert.deepEqual(current.readingSections['1'],[0,1]);assert.equal(current.notes['1'],'Mi resumen');
 assert.throws(()=>applyProgressCommand(current,{type:'toggle',key:'weeks',value:99}));
});
test('Importación fusiona progreso y conserva calificación más alta',()=>{
 const current={...emptyProgress(),weeks:[2],quizzes:{fundamentos:80},notes:{'2':'servidor'}};
 const incoming={...emptyProgress(),weeks:[1,2],quizzes:{fundamentos:20},notes:{'2':'local'}};
 const combined=mergeProgress(current,incoming);
 assert.deepEqual(combined.weeks,[]);assert.equal(combined.quizzes.fundamentos,80);assert.equal(combined.notes['2'],'servidor');
});
