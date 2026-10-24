import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {ManageStudents,AdminDomainError,assertStudentMutation,progressPercent}=require('../libs/administration/dist/index.js');
function fixture(){
 const all=new Map();const actions=[];
 const repo={
  async list({search,status,page,limit}){const values=[...all.values()].filter(s=>s.email.includes(search)&&(status==='all'||s.isActive===(status==='active')));return {data:values,total:values.length,page,limit}},
  async get(id){return all.has(id)?{student:all.get(id),progress:{completedWeeks:[],progressPercent:0}}:null},
  async metrics(){return {students:all.size,activeStudents:[...all.values()].filter(s=>s.isActive).length,studentsWithProgress:0,averageProgressPercent:0}},
  async create({email,passwordHash},actorId){assert.equal(passwordHash,'scrypt:'+email.slice(0,0)+'initial-password');const user={id:'student-1',email,role:'STUDENT',isActive:true,createdAt:'2026-10-23',updatedAt:'2026-10-23'};all.set(user.id,user);actions.push(['CREATE',actorId]);return user},
  async change(id,change,actorId){const current=all.get(id);if(!current)return null;assertStudentMutation(actorId,id,current.role);const next={...current,...change};all.set(id,next);actions.push(['CHANGE',actorId]);return next},
  async events(){return []},async audit(){return {data:[],total:0}}
 };
 const admin=new ManageStudents(repo,{hash:async()=> 'scrypt:initial-password',verify:async()=>true});
 return {admin,repo,actions};
}
test('Cuentas administradas: solo STUDENT, normalización, búsqueda y desactivación',async()=>{
 const {admin,actions}=fixture();
 const created=await admin.create(' ALUMNO@EXAMPLE.COM ','initial-password','admin-1');
 assert.equal(created.role,'STUDENT');assert.equal(created.email,'alumno@example.com');
 assert.equal((await admin.list('alumno')).total,1);
 assert.equal((await admin.change(created.id,'admin-1',{isActive:false})).isActive,false);
 assert.equal((await admin.list('','inactive')).total,1);
 assert.deepEqual(actions.map(x=>x[0]),['CREATE','CHANGE']);
});
test('No es posible modificar ADMIN ni al actor',async()=>{
 assert.throws(()=>assertStudentMutation('id','id','STUDENT'),AdminDomainError);
 assert.throws(()=>assertStudentMutation('admin','otro','ADMIN'),AdminDomainError);
 assert.throws(()=>assertStudentMutation('admin','otro','INSTRUCTOR'),AdminDomainError);
 assert.doesNotThrow(()=>assertStudentMutation('admin','otro','STUDENT'));
 const {admin}=fixture();await assert.rejects(()=>admin.change('admin','admin',{isActive:false}),AdminDomainError);
});
test('No se aceptan contraseñas débiles ni datos inconsistentes',async()=>{
 const {admin}=fixture();
 await assert.rejects(()=>admin.create('x@example.com','weak','admin-1'),AdminDomainError);
 await assert.rejects(()=>admin.detail('sin-registro'),AdminDomainError);
 assert.equal(progressPercent(0),0);assert.equal(progressPercent(1),4);assert.equal(progressPercent(24),100);assert.equal(progressPercent(30),100);
});
test('La migración 003 crea eventos, índices y vista SQL de progreso',async()=>{
 const {readFileSync}=await import('node:fs');
 const sql=readFileSync(new URL('../packages/database/sql/003_administration_audit.sql',import.meta.url),'utf8');
 for(const word of ['admin_audit_events','student_progress_events','vw_student_progress_summary','is_active','created_at'])assert.match(sql,new RegExp(word));
 assert.doesNotMatch(sql,/DROP\s+TABLE/i);
});
