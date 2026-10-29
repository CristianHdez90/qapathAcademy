import test from 'node:test';
import assert from 'node:assert/strict';
import {createCatalogFixture} from './helpers/catalog-fixture.mjs';
/** SPEC-CONTENT-320: lecciones por archivos sobre PostgreSQL (PGlite) y los guards HTTP reales. */
test('study lessons: admin uploads files, publishes, students read only published content of available courses',async t=>{
 const f=await createCatalogFixture();t.after(()=>f.close());
 const call=async(path,method='GET',body,token)=>{const response=await fetch(f.base+'/api/v1'+path,{method,headers:{'Content-Type':'application/json',Origin:'http://localhost:3017',...(token?{Cookie:f.cookieName+'='+token}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:response.status,body:await response.json()}};
 const courses=(await call('/admin/courses?search=fundamentos','GET',undefined,'admin')).body.data.items,fundamentos=courses.find(c=>c.slug==='fundamentos');
 const base=`/admin/courses/${fundamentos.id}/lessons`;
 for(const [token,status]of [[undefined,401],['student-a',403],['instructor',403]])assert.equal((await call(base,'GET',undefined,token)).status,status);
 const files=[{filename:'01-lectura.md',content:'# Lectura\r\n\r\n```mermaid\nflowchart LR\nA-->B\n```'},{filename:'02-flujo.mmd',content:'flowchart TB\nA-->B'},{filename:'03-mapa.json',content:JSON.stringify({type:'graph',title:'Mapa',nodes:[{id:'a',label:'A',detail:{text:'Globo'}}]})}];
 assert.equal((await call(base,'POST',{title:'Mala',files:[{filename:'a.drawio',content:'<mxfile/>'}]},'admin')).status,400);
 const created=await call(base,'POST',{title:'Lección uno',summary:'Resumen',files},'admin');assert.equal(created.status,201);let lesson=created.body.data;
 assert.equal(lesson.status,'DRAFT');assert.deepEqual(lesson.files.map(x=>x.kind),['markdown','mermaid','interaction']);assert.equal(lesson.files[0].content.includes('\r'),false);
 assert.deepEqual((await call('/courses/fundamentos/lessons')).body.data,[]);
 assert.equal((await call(`/courses/fundamentos/lessons/${lesson.id}`)).status,404);
 const order=[{id:lesson.files[2].id},{filename:'04-imagen.svg',content:'<svg xmlns="http://www.w3.org/2000/svg"><rect width="4" height="4"/></svg>'},{id:lesson.files[0].id}];
 const updated=await call(`${base}/${lesson.id}`,'PATCH',{revision:lesson.revision,title:'Lección uno',summary:'Resumen',status:'PUBLISHED',files:order},'admin');
 assert.equal(updated.status,200);lesson=updated.body.data;assert.deepEqual(lesson.files.map(x=>x.filename),['03-mapa.json','04-imagen.svg','01-lectura.md']);
 assert.equal((await call(`${base}/${lesson.id}`,'PATCH',{revision:1,title:'Lección uno',summary:'',status:'DRAFT',files:[]},'admin')).status,409);
 const retired=await f.db.query('SELECT count(*)::int total,count(retired_at)::int retired FROM course_lesson_files');assert.deepEqual(retired.rows[0],{total:4,retired:1});
 const list=(await call('/courses/fundamentos/lessons')).body.data;assert.equal(list.length,1);assert.equal(list[0].fileCount,3);
 assert.equal((await call(`/courses/fundamentos/lessons/${lesson.id}`)).body.data.files.length,3);
 // «En construcción» oculta el contenido a estudiantes aunque la lección esté publicada.
 const manual=(await call('/admin/courses?search=manual','GET',undefined,'admin')).body.data.items.find(c=>c.slug==='manual');
 const other=(await call(`/admin/courses/${manual.id}/lessons`,'POST',{title:'Pronto',files:[files[1]]},'admin')).body.data;
 await call(`/admin/courses/${manual.id}/lessons/${other.id}`,'PATCH',{revision:1,title:'Pronto',summary:'',status:'PUBLISHED',files:[{id:other.files[0].id}]},'admin');
 assert.deepEqual((await call('/courses/manual/lessons')).body.data,[]);
 // Archivar es reversible y nunca borra filas.
 const archived=await call(`${base}/${lesson.id}`,'DELETE',{revision:lesson.revision},'admin');assert.equal(archived.status,200);assert.equal(archived.body.data.status,'ARCHIVED');
 assert.deepEqual((await call('/courses/fundamentos/lessons')).body.data,[]);
 const restored=await call(`${base}/${lesson.id}/restore`,'POST',{revision:archived.body.data.revision},'admin');assert.equal(restored.body.data.status,'DRAFT');
 const audit=await f.db.query("SELECT action FROM admin_audit_events WHERE action LIKE 'LESSON%' ORDER BY created_at");assert.ok(audit.rows.length>=5);
});
