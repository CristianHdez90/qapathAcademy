import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const {weekRequirements}=require('../libs/progress/dist/index.js');
const json=file=>JSON.parse(readFileSync(new URL('../'+file,import.meta.url),'utf8'));
test('learning tree follows every module, week and chapter without publishing quiz answers',()=>{
 const tree=json('apps/web/src/features/navigation/learning-tree.json'),catalog=json('libs/content/src/data/catalog.json'),guides=json('libs/content/src/data/study-guides.json'),foundation=json('libs/content/src/data/fundamentals-v2.json');
 assert.equal(tree.length,8);assert.equal(tree.flatMap(m=>m.weeks).length,24);
 for(const module of tree){const source=catalog.modules.find(m=>m.id===module.id);assert.deepEqual(module.weeks.map(w=>w.id),source.weeks);for(const week of module.weeks){const v2=foundation.weeks[String(week.id)];if(v2){assert.deepEqual(week.chapters,v2.chapters.map(c=>c.title));assert.equal(week.guided,null);assert.deepEqual(week.foundation.map(c=>c.cards.map(card=>card.id)),v2.chapters.map(c=>c.cards.map(card=>card.id)))}else{assert.deepEqual(week.chapters,guides[week.id].sections.map(s=>s.title));assert.equal(week.guided,guides[week.id].example.title);assert.equal(week.foundation,null)}}const assigned=new Set(module.weeks.flatMap(w=>weekRequirements(w.id).labs));for(const lab of module.labs)assert.ok(assigned.has(lab.id),`${lab.id} reachable from a week`)}
 assert.doesNotMatch(JSON.stringify(tree),/"correct"|"answer"|"question"|"options"/);
});
