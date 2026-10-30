import test from 'node:test';
import assert from 'node:assert/strict';
import {createCatalogFixture} from './helpers/catalog-fixture.mjs';
/** SPEC-CONTENT-321: biblioteca de lecciones sobre PostgreSQL (PGlite), asignación a cursos y guards HTTP reales. */
test('library lessons: CRUD, assignment as course content, index order and recoverable delete',async t=>{
 const f=await createCatalogFixture();t.after(()=>f.close());
 const call=async(path,method='GET',body,token)=>{const response=await fetch(f.base+'/api/v1'+path,{method,headers:{'Content-Type':'application/json',Origin:'http://localhost:3017',...(token?{Cookie:f.cookieName+'='+token}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:response.status,body:await response.json()}};
 for(const [token,status]of [[undefined,401],['student-a',403],['instructor',403]])assert.equal((await call('/admin/lessons','GET',undefined,token)).status,status);
 const files=[{filename:'01-lectura.md',content:'# Lectura\r\n\r\n```mermaid\nflowchart LR\nA-->B\n```'},{filename:'02-flujo.mmd',content:'flowchart TB\nA-->B'},{filename:'03-mapa.json',content:JSON.stringify({type:'graph',title:'Mapa',nodes:[{id:'a',label:'A',detail:{text:'Globo'}}]})}];
 assert.equal((await call('/admin/lessons','POST',{title:'Mala',files:[{filename:'a.drawio',content:'<mxfile/>'}]},'admin')).status,400);
 // Crear
 let a=(await call('/admin/lessons','POST',{title:'Lección A',summary:'Resumen',files},'admin'));assert.equal(a.status,201);a=a.body.data;
 assert.equal(a.status,'DRAFT');assert.deepEqual(a.files.map(x=>x.kind),['markdown','mermaid','interaction']);assert.equal(a.files[0].content.includes('\r'),false);assert.deepEqual(a.courses,[]);
 let b=(await call('/admin/lessons','POST',{title:'Lección B',status:'PUBLISHED',files:[files[1]]},'admin')).body.data;
 // Editar y publicar, con orden nuevo de archivos
 const updated=await call(`/admin/lessons/${a.id}`,'PATCH',{revision:a.revision,title:'Lección A',summary:'Resumen',status:'PUBLISHED',files:[{id:a.files[2].id},{filename:'04-imagen.svg',content:'<svg xmlns="http://www.w3.org/2000/svg"><rect width="4" height="4"/></svg>'},{id:a.files[0].id}]},'admin');
 assert.equal(updated.status,200);a=updated.body.data;assert.deepEqual(a.files.map(x=>x.filename),['03-mapa.json','04-imagen.svg','01-lectura.md']);
 assert.equal((await call(`/admin/lessons/${a.id}`,'PATCH',{revision:1,title:'X título',summary:'',status:'DRAFT',files:[]},'admin')).status,409);
 // Asignar a un curso CURATED nuevo y a Fundamentos (heredado) como contenido asignado; el índice respeta el orden.
 const input={slug:'curso-lecciones',title:'Curso con lecciones',summary:'Solo lecciones de la biblioteca',description:'',category:'QA',skills:[],position:20,cover:null,contentKind:'CURATED',assignments:[{kind:'LESSON',ref:b.id},{kind:'LESSON',ref:a.id}]};
 let course=(await call('/admin/courses','POST',input,'admin')).body.data;
 course=(await call(`/admin/courses/${course.id}`,'PATCH',{...input,revision:course.revision,status:'PUBLISHED'},'admin')).body.data;assert.equal(course.status,'PUBLISHED');
 assert.deepEqual((await call('/courses/curso-lecciones/lessons')).body.data.map(l=>l.title),['Lección B','Lección A']);
 assert.equal((await call(`/courses/curso-lecciones/lessons/${a.id}`)).body.data.files.length,3);
 assert.equal((await call('/admin/courses','POST',{...input,slug:'curso-fantasma',assignments:[{kind:'LESSON',ref:'6f1c3a52-3e1b-4c55-9d0e-1a2b3c4d5e6f'}]},'admin')).status,400);
 const fundamentos=(await call('/admin/courses?search=fundamentos','GET',undefined,'admin')).body.data.items.find(c=>c.slug==='fundamentos');
 const fInput={slug:fundamentos.slug,title:fundamentos.title,summary:fundamentos.summary,description:fundamentos.description,category:fundamentos.category,skills:fundamentos.skills,position:fundamentos.position,cover:fundamentos.cover,contentKind:fundamentos.contentKind,comingSoon:fundamentos.comingSoon,assignments:[...fundamentos.assignments,{kind:'LESSON',ref:a.id}]};
 assert.equal((await call(`/admin/courses/${fundamentos.id}`,'PATCH',{...fInput,revision:fundamentos.revision,status:'PUBLISHED'},'admin')).status,200);
 assert.deepEqual((await call('/courses/fundamentos/lessons')).body.data.map(l=>l.title),['Lección A']);
 assert.equal((await call(`/admin/lessons/${a.id}`,'GET',undefined,'admin')).body.data.courses.length,2);
 // Un borrador asignado no se ve; la lección no asignada no se abre desde otro curso.
 assert.equal((await call(`/courses/fundamentos/lessons/${b.id}`)).status,404);
 // Eliminar (recuperable): sale de los cursos y de la biblioteca activa; restaurar la devuelve como borrador sin asignar.
 const removed=await call(`/admin/lessons/${a.id}`,'DELETE',{revision:a.revision},'admin');assert.equal(removed.status,200);assert.ok(removed.body.data.deletedAt);
 assert.deepEqual((await call('/courses/curso-lecciones/lessons')).body.data.map(l=>l.title),['Lección B']);
 assert.deepEqual((await call('/courses/fundamentos/lessons')).body.data,[]);
 assert.equal((await call('/admin/lessons','GET',undefined,'admin')).body.data.some(l=>l.id===a.id),false);
 assert.equal((await call('/admin/lessons?deleted=true','GET',undefined,'admin')).body.data[0].id,a.id);
 assert.equal((await call(`/admin/lessons/${a.id}`,'PATCH',{revision:removed.body.data.revision,title:'Lección A',summary:'',status:'DRAFT',files:[]},'admin')).status,409);
 const restored=await call(`/admin/lessons/${a.id}/restore`,'POST',{revision:removed.body.data.revision},'admin');assert.equal(restored.status,201);
 assert.equal(restored.body.data.deletedAt,null);assert.equal(restored.body.data.status,'DRAFT');assert.deepEqual(restored.body.data.courses,[]);
 const rows=await f.db.query('SELECT count(*)::int total FROM course_lessons');assert.equal(rows.rows[0].total,2);
 const audit=await f.db.query("SELECT action FROM admin_audit_events WHERE action LIKE 'LESSON%' ORDER BY created_at");
 assert.deepEqual([...new Set(audit.rows.map(r=>r.action))].sort(),['LESSON_CREATED','LESSON_DELETED','LESSON_RESTORED','LESSON_UPDATED']);
});
