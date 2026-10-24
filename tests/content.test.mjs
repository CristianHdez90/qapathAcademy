import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {contentSnapshot:{catalog,guides,scrum}}=require('../libs/content/dist/index.js');
test('Mantiene 8 módulos, 24 semanas y 24 guías',()=>{
 assert.equal(catalog.modules.length,8);
 assert.equal(catalog.weeks.length,24);
 assert.equal(Object.keys(guides).length,24);
 assert.equal(new Set(catalog.weeks.map(w=>w.id)).size,24);
});
test('Cada semana pertenece a un módulo válido y tiene secciones completas',()=>{
 for(const week of catalog.weeks){
  assert.ok(catalog.modules.some(m=>m.id===week.module));
  assert.ok(guides[week.id]);assert.ok(guides[week.id].sections.length>=3);
 }
});
test('Preguntas y Scrum con estructura válida',()=>{
 for(const quiz of Object.values(catalog.quizzes))for(const q of quiz){
  assert.ok(q.a.length>1);assert.ok(q.correct>=0&&q.correct<q.a.length);
 }
 assert.equal(scrum.events.length,5);assert.equal(scrum.steps.length,7);
});
