import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),apiRequire=createRequire(new URL('../apps/api/package.json',import.meta.url));
let local=false;try{const url=new URL(process.env.DATABASE_URL);local=['localhost','127.0.0.1','[::1]'].includes(url.hostname)&&/^\/qapath_firebase_test_[a-f0-9]{12}$/.test(url.pathname)}catch{}
test('CTFL results persist separately from professional progress in PostgreSQL',{skip:!local},async()=>{
 const {createDatabase}=apiRequire('@qapath/database');const {progressPercentage}=apiRequire('@qapath/progress');
 const {PostgresProgressAdapter}=require('../apps/api/dist/infrastructure/adapters/postgres-progress.adapter');
 const connection=createDatabase(process.env.DATABASE_URL);const adapter=new PostgresProgressAdapter({db:connection.db});
 try{
  const {rows}=await connection.pool.query("INSERT INTO users(email,password_hash) VALUES('ctfl-persistence@example.test','unused') RETURNING id");const id=rows[0].id;
  const before=await adapter.apply(id,{type:'reading-section',week:1,section:0});
  const text=JSON.stringify({mode:'ctfl-mock',score:26,total:40,percent:65,passed:true,completedAt:'2026-10-24T12:00:00Z'});
  await adapter.apply(id,{type:'submit-evidence',kind:'certification',id:'ctfl-mock',text});
  const after=await adapter.get(id);assert.equal(after.evidence['certification:ctfl-mock'],text);
  assert.equal(progressPercentage(after),progressPercentage(before));assert.deepEqual(after.readingSections,before.readingSections);assert.deepEqual(after.weeks,before.weeks);
  const events=await connection.pool.query('SELECT details FROM student_progress_events WHERE user_id=$1 ORDER BY revision DESC LIMIT 1',[id]);
  assert.deepEqual(events.rows[0].details,{kind:'certification',id:'ctfl-mock'});assert.equal(JSON.stringify(events.rows).includes(text),false);
 }finally{await connection.pool.end()}
});
