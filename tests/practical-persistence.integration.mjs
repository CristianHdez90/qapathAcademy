import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),apiRequire=createRequire(new URL('../apps/api/package.json',import.meta.url));
let local=false;try{const url=new URL(process.env.DATABASE_URL);local=['localhost','127.0.0.1','[::1]'].includes(url.hostname)&&/^\/qapath_firebase_test_[a-f0-9]{12}$/.test(url.pathname)}catch{}
test('additional exercise evidence persists in PostgreSQL without altering existing advancement or leaking text to audit',{skip:!local},async()=>{
 const {createDatabase}=apiRequire('@qapath/database');const {progressPercentage}=apiRequire('@qapath/progress');
 const {PostgresProgressAdapter}=require('../apps/api/dist/infrastructure/adapters/postgres-progress.adapter');
 const connection=createDatabase(process.env.DATABASE_URL);const adapter=new PostgresProgressAdapter({db:connection.db});
 try{
  const {rows}=await connection.pool.query("INSERT INTO users(email,password_hash) VALUES('exercise-persistence@example.test','unused') RETURNING id");const id=rows[0].id;
  const before=await adapter.apply(id,{type:'reading-section',week:1,section:0});
  const text='Ejecuté 27 solicitudes de Postman con datos sintéticos y conservé las aserciones, resultados y conclusiones.';
  await adapter.apply(id,{type:'submit-evidence',kind:'exercise',id:'7',text});
  const after=await adapter.get(id);assert.equal(after.evidence['exercise:7'],text);assert.equal(progressPercentage(after),progressPercentage(before));assert.deepEqual(after.weeks,before.weeks);assert.deepEqual(after.readingSections,before.readingSections);
  const events=await connection.pool.query('SELECT details FROM student_progress_events WHERE user_id=$1 ORDER BY revision DESC LIMIT 1',[id]);assert.deepEqual(events.rows[0].details,{kind:'exercise',id:'7'});assert.equal(JSON.stringify(events.rows).includes(text),false);
  // The runner drops the disposable database; audit foreign keys deliberately retain users.
 }finally{await connection.pool.end()}
});
