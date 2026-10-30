import test from 'node:test';
import assert from 'node:assert/strict';
import {createCatalogFixture} from './helpers/catalog-fixture.mjs';
/** SPEC-CONTENT-330: borrador/publicación del contenido del curso, lectura pública sin respuestas, minitest y avance. */
test('course outline: admin edits and publishes; students read, grade and save progress; Fundamentos copy imports as draft',async t=>{
 const f=await createCatalogFixture();t.after(()=>f.close());
 const call=async(path,method='GET',body,token)=>{const response=await fetch(f.base+'/api/v1'+path,{method,headers:{'Content-Type':'application/json',Origin:'http://localhost:3017',...(token?{Cookie:f.cookieName+'='+token}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:response.status,body:await response.json()}};
 const fundamentos=(await call('/admin/courses?search=fundamentos','GET',undefined,'admin')).body.data.items.find(c=>c.slug==='fundamentos');
 const base=`/admin/courses/${fundamentos.id}/outline`;
 for(const [token,status]of [[undefined,401],['student-a',403],['instructor',403]])assert.equal((await call(base,'GET',undefined,token)).status,status);
 let state=(await call(base,'GET',undefined,'admin')).body.data;assert.deepEqual(state.draft,{weeks:[]});assert.equal(state.publishedAt,null);
 assert.equal((await call('/courses/fundamentos/outline')).status,404);
 // Importar copia de Fundamentos (borrador): lo publicado no cambia.
 state=(await call(`${base}/import-fundamentals`,'POST',{expectedRevision:0},'admin')).body.data;
 assert.equal(state.draft.weeks.length,2);assert.ok(state.draft.weeks[0].chapters[0].cards.length>3);assert.ok(state.draft.weeks[0].chapters[0].quiz.length>0);assert.equal(state.dirty,true);
 assert.equal((await call('/courses/fundamentos/outline')).status,404);
 // Editar: reemplazar por un contenido corto y validar errores.
 const outline={weeks:[{id:'w1',title:'Semana uno',summary:'Resumen',chapters:[{id:'c1',title:'Capítulo uno',outcome:'',cards:[{id:'k1',title:'Primera',text:'**Hola**',visuals:[{filename:'flujo.mmd',content:'flowchart LR\nA-->B'}]},{id:'k2',title:'Segunda',text:'Texto',visuals:[]}],quiz:[{id:'q1',question:'¿Pregunta?',options:['No','Sí'],correct:1,explanation:'Porque sí.'}]}]}]};
 assert.equal((await call(`${base}/draft`,'PUT',{expectedRevision:state.draftRevision,outline:{weeks:[{...outline.weeks[0],chapters:[{...outline.weeks[0].chapters[0],cards:[{id:'k1',title:'X título',text:'',visuals:[{filename:'a.drawio',content:'<x/>'}]}]}]}]}},'admin')).status,400);
 assert.equal((await call(`${base}/draft`,'PUT',{expectedRevision:99,outline},'admin')).status,409);
 state=(await call(`${base}/draft`,'PUT',{expectedRevision:state.draftRevision,outline},'admin')).body.data;
 assert.equal((await call(`${base}/publish`,'POST',{expectedRevision:state.draftRevision-1},'admin')).status,409);
 state=(await call(`${base}/publish`,'POST',{expectedRevision:state.draftRevision},'admin')).body.data;assert.ok(state.publishedAt);assert.equal(state.dirty,false);
 // Lectura pública sin respuestas
 const pub=(await call('/courses/fundamentos/outline')).body.data;assert.equal(pub.weeks[0].chapters[0].quiz[0].correct,undefined);assert.equal(pub.weeks[0].chapters[0].cards[0].visuals[0].kind,'mermaid');
 // Estudiante: avance y minitest
 assert.equal((await call('/me/courses/fundamentos/outline-progress','GET',undefined,'admin')).status,403);
 assert.deepEqual((await call('/me/courses/fundamentos/outline-progress/read','POST',{cardIds:['k1','inventada']},'student-a')).body.data.readCards,['k1']);
 const failed=(await call('/me/courses/fundamentos/outline-progress/chapters/c1/grade','POST',{answers:{q1:0}},'student-a')).body.data;assert.equal(failed.passed,false);assert.equal(failed.feedback[0].expected,1);
 const passed=(await call('/me/courses/fundamentos/outline-progress/chapters/c1/grade','POST',{answers:{q1:1}},'student-a')).body.data;assert.equal(passed.percent,100);
 await call('/me/courses/fundamentos/outline-progress/chapters/c1/grade','POST',{answers:{q1:0}},'student-a');
 const progress=(await call('/me/courses/fundamentos/outline-progress','GET',undefined,'student-a')).body.data;assert.deepEqual(progress,{readCards:['k1'],passedChapters:{c1:100}});
 assert.equal((await call('/courses/fundamentos/outline/chapters/c1/grade','POST',{answers:{q1:1}})).body.data.passed,true);
 // Descartar y despublicar conservan el contenido
 state=(await call(`${base}/draft`,'PUT',{expectedRevision:state.draftRevision,outline:{weeks:[]}},'admin')).body.data;assert.equal(state.dirty,true);
 state=(await call(`${base}/discard`,'POST',{expectedRevision:state.draftRevision},'admin')).body.data;assert.equal(state.draft.weeks[0].id,'w1');
 state=(await call(`${base}/unpublish`,'POST',undefined,'admin')).body.data;assert.equal(state.publishedAt,null);assert.equal(state.draft.weeks[0].id,'w1');
 assert.equal((await call('/courses/fundamentos/outline')).status,404);
 const audit=await f.db.query("SELECT DISTINCT action FROM admin_audit_events WHERE action LIKE 'OUTLINE%' ORDER BY action");
 assert.deepEqual(audit.rows.map(r=>r.action),['OUTLINE_DRAFT_DISCARDED','OUTLINE_DRAFT_SAVED','OUTLINE_FUNDAMENTALS_IMPORTED','OUTLINE_PUBLISHED','OUTLINE_UNPUBLISHED']);
});
