import test from 'node:test';
import assert from 'node:assert/strict';
import {createCatalogFixture} from './helpers/catalog-fixture.mjs';
/** SPEC-CONTENT-331: módulos propios (CRUD recuperable), su contenido y su asignación a cursos; slug editable. */
test('own modules: create, edit content, assign to a course (combined outline), delete unlinks, restore; slug change',async t=>{
 const f=await createCatalogFixture();t.after(()=>f.close());
 const call=async(path,method='GET',body,token)=>{const response=await fetch(f.base+'/api/v1'+path,{method,headers:{'Content-Type':'application/json',Origin:'http://localhost:3017',...(token?{Cookie:f.cookieName+'='+token}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:response.status,body:await response.json()}};
 for(const [token,status]of [[undefined,401],['student-a',403]])assert.equal((await call('/admin/modules','GET',undefined,token)).status,status);
 assert.equal((await call('/admin/modules','POST',{title:'x'},'admin')).status,400);
 let mod=(await call('/admin/modules','POST',{title:'Módulo de APIs',summary:'Pruebas de API'},'admin')).body.data;
 assert.equal(mod.track,'QA');assert.equal(mod.published,false);
 mod=(await call(`/admin/modules/${mod.id}`,'PATCH',{revision:mod.revision,title:'Módulo de APIs REST',summary:'Pruebas de API',track:'Automatización'},'admin')).body.data;assert.equal(mod.title,'Módulo de APIs REST');
 assert.equal((await call(`/admin/modules/${mod.id}`,'PATCH',{revision:1,title:'Otro nombre',summary:'',track:'QA'},'admin')).status,409);
 // Contenido del módulo: mismo editor (borrador → publicado)
 const base=`/admin/modules/${mod.id}/outline`;
 let state=(await call(base,'GET',undefined,'admin')).body.data;assert.equal(state.ownerKind,'module');assert.equal(state.title,'Módulo de APIs REST');
 const outline={weeks:[{id:'w1',title:'Semana de APIs',summary:'| Cap | Tema |\n|---|---|\n| 1 | [Verbos](capitulo:1) |',chapters:[{id:'c1',title:'Verbos HTTP',outcome:'',cards:[{id:'k1',title:'GET y POST',text:'Texto',source:'C01-verbos.md',visuals:[]}],quiz:[{id:'q1',question:'¿GET modifica?',options:['Sí','No'],correct:1,explanation:''}]}]}]};
 state=(await call(`${base}/draft`,'PUT',{expectedRevision:state.draftRevision,outline},'admin')).body.data;
 state=(await call(`${base}/publish`,'POST',{expectedRevision:state.draftRevision},'admin')).body.data;assert.ok(state.publishedAt);
 // Asignar a un curso propio (solo el módulo)
 const input={slug:'curso-apis',title:'Curso de APIs',summary:'Con un módulo propio',description:'',category:'QA',skills:[],position:30,cover:null,contentKind:'CURATED',assignments:[{kind:'MODULE',ref:mod.id}]};
 assert.equal((await call('/admin/courses','POST',{...input,slug:'curso-x',assignments:[{kind:'MODULE',ref:'6f1c3a52-3e1b-4c55-9d0e-1a2b3c4d5e6f'}]},'admin')).status,400);
 let course=(await call('/admin/courses','POST',input,'admin')).body.data;
 course=(await call(`/admin/courses/${course.id}`,'PATCH',{...input,revision:course.revision,status:'PUBLISHED'},'admin')).body.data;assert.equal(course.status,'PUBLISHED');
 const listed=(await call('/admin/modules','GET',undefined,'admin')).body.data.find(m=>m.id===mod.id);assert.deepEqual(listed.courses.map(c=>c.slug),['curso-apis']);assert.equal(listed.weeks,1);assert.equal(listed.published,true);
 const pub=(await call('/courses/curso-apis/outline')).body.data;
 const prefix='m'+mod.id.replace(/-/g,'').slice(0,6)+'_';
 assert.equal(pub.weeks[0].title,'Semana de APIs');assert.equal(pub.weeks[0].chapters[0].id,prefix+'c1');assert.equal(pub.weeks[0].chapters[0].cards[0].source,'C01-verbos.md');assert.equal(pub.weeks[0].chapters[0].quiz[0].correct,undefined);
 assert.deepEqual((await call('/me/courses/curso-apis/outline-progress/read','POST',{cardIds:[prefix+'k1']},'student-a')).body.data.readCards,[prefix+'k1']);
 assert.equal((await call(`/me/courses/curso-apis/outline-progress/chapters/${prefix}c1/grade`,'POST',{answers:{q1:1}},'student-a')).body.data.passed,true);
 // Slug editable (curso propio); los cursos base lo conservan
 course=(await call(`/admin/courses/${course.id}`,'PATCH',{...input,slug:'curso-apis-rest',revision:course.revision,status:'PUBLISHED'},'admin')).body.data;assert.equal(course.slug,'curso-apis-rest');
 assert.equal((await call('/courses/curso-apis-rest/outline')).status,200);
 const fundamentos=(await call('/admin/courses?search=fundamentos','GET',undefined,'admin')).body.data.items.find(c=>c.slug==='fundamentos');
 const fInput={slug:'fundamentos-2',title:fundamentos.title,summary:fundamentos.summary,description:fundamentos.description,category:fundamentos.category,skills:fundamentos.skills,position:fundamentos.position,cover:fundamentos.cover,contentKind:fundamentos.contentKind,comingSoon:fundamentos.comingSoon,assignments:fundamentos.assignments};
 const seeded=await call(`/admin/courses/${fundamentos.id}`,'PATCH',{...fInput,revision:fundamentos.revision,status:fundamentos.status},'admin');
 assert.equal(seeded.status,409);assert.match(seeded.body.error.message,/catálogo base/);
 const taken=await call(`/admin/courses/${course.id}`,'PATCH',{...input,slug:'fundamentos',revision:course.revision,status:'PUBLISHED'},'admin');assert.equal(taken.status,409);
 // Eliminar lo quita del curso (el avance se conserva); restaurar lo devuelve sin asignar
 const removed=(await call(`/admin/modules/${mod.id}`,'DELETE',{revision:listed.revision},'admin')).body.data;assert.ok(removed.deletedAt);assert.deepEqual(removed.courses,[]);
 assert.equal((await call('/courses/curso-apis-rest/outline')).status,404);
 assert.equal((await call(base,'GET',undefined,'admin')).status,404);
 assert.equal((await f.db.query('SELECT count(*)::int n FROM course_outline_progress WHERE course_id=$1',[course.id])).rows[0].n,1);
 assert.deepEqual((await call('/admin/modules?deleted=true','GET',undefined,'admin')).body.data.map(m=>m.id),[mod.id]);
 const restored=(await call(`/admin/modules/${mod.id}/restore`,'POST',{revision:removed.revision},'admin')).body.data;assert.equal(restored.deletedAt,null);assert.equal(restored.published,true);
 const audit=await f.db.query("SELECT DISTINCT action FROM admin_audit_events WHERE action LIKE 'MODULE%' ORDER BY action");
 assert.deepEqual(audit.rows.map(r=>r.action),['MODULE_CREATED','MODULE_DELETED','MODULE_RESTORED','MODULE_UPDATED']);
});
