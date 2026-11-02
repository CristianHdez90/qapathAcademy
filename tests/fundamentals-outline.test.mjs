import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {loadApiSource} from './helpers/catalog-fixture.mjs';
const require=createRequire(import.meta.url);
const {courseOutlineSchema,checkStudyFile}=require('../packages/contracts/dist/index.js');
const {normalizeOutline}=require('../libs/learning/dist/index.js');
const source=require('../libs/content/src/data/fundamentals-v2.json');
/** La copia editable de Fundamentos conserva toda la lectura original (apertura, tarjetas, caso, mapa, globos, actividad, entregable, cierre). */
test('copia de Fundamentos: misma estructura y contenido que la lectura original, válida para el editor',()=>{
 const {fundamentalsOutline}=loadApiSource('src/infrastructure/adapters/fundamentals-outline.ts');
 const outline=fundamentalsOutline();
 assert.equal(courseOutlineSchema.safeParse(outline).success,true);
 assert.doesNotThrow(()=>normalizeOutline(outline,checkStudyFile));
 const chapters=Object.values(source.weeks??source).flatMap(w=>w.chapters);
 const copied=outline.weeks.flatMap(w=>w.chapters);
 assert.equal(copied.length,chapters.length);
 for(const original of chapters){
  const copy=copied.find(c=>c.id===original.id);const ids=copy.cards.map(c=>c.id);
  assert.equal(ids[0],`${original.id}-apertura`);
  for(const card of original.cards)assert.ok(ids.includes(card.id),`tarjeta ${card.id}`);
  for(const [field,suffix] of [['teamCase','caso'],['diagram','mapa'],['balloons','aplica'],['activity','actividad'],['transfer','entregable']])if(original[field])assert.ok(ids.includes(`${original.id}-${suffix}`),`${original.id} ${field}`);
  assert.equal(ids.at(-1),`${original.id}-cierre`);
  assert.equal(copy.quiz.length,original.cards.flatMap(c=>c.checks).length,'todas las preguntas');
  // Los bloques ```qapath-… contienen JSON válido.
  for(const card of copy.cards)for(const m of card.text.matchAll(/```(qapath-[\w-]+)\n([\s\S]*?)\n```/g))if(m[1]!=='qapath-destacado')assert.doesNotThrow(()=>JSON.parse(m[2]),`${card.id} ${m[1]}`);
 }
 const opening=copied[0].cards[0].text;
 assert.match(opening,/## La escena/);assert.match(opening,/qapath-pregunta/);assert.match(opening,/Resultados de aprendizaje/);
 assert.equal(JSON.parse(copied[0].cards[0].visuals[0].content).view,'types-map');
 assert.deepEqual(JSON.parse(copied[0].cards[2].visuals[0].content).focus,['functional'],'el mapa resalta el concepto de la tarjeta');
});
test('gráfica «fundamentos»: vistas permitidas y foco validado',()=>{
 assert.equal(checkStudyFile('mapa.json','{"type":"fundamentos","view":"types-map","focus":["functional"]}').ok,true);
 assert.equal(checkStudyFile('niveles.json','{"type":"fundamentos","view":"levels-pyramid","focus":"system","compact":true}').ok,true);
 assert.equal(checkStudyFile('x.json','{"type":"fundamentos","view":"iframe"}').ok,false);
 assert.equal(checkStudyFile('x.json','{"type":"fundamentos","view":"types-map","focus":["hack"]}').ok,false);
 assert.equal(checkStudyFile('x.json','{"type":"fundamentos","view":"bloques","blocks":[{"kind":"script"}]}').ok,false);
});
