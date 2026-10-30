import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript'),module={exports:{}};
new Function('module','exports',ts.transpileModule(readFileSync(new URL('../apps/web/src/features/progress/study-steps.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(module,module.exports);
const {studySteps,resolveStudyStep}=module.exports;
const guides=JSON.parse(readFileSync(new URL('../libs/content/src/data/study-guides.json',import.meta.url),'utf8'));
const exercises=JSON.parse(readFileSync(new URL('../libs/content/src/data/practical-exercises.json',import.meta.url),'utf8'));

test('all 24 guides retain each source unit exactly once, in source order',()=>{
 for(let week=1;week<=24;week++){
  const guide={...guides[week],exercise:exercises[week]},steps=studySteps(guide);
  assert.equal(new Set(steps.map(step=>step.id)).size,steps.length);
  assert.equal(steps[0].kind,'intro');assert.equal(steps.at(-1).kind,'finish');
  const expected=[...guide.sections,guide.example].flatMap((section,chapter)=>(section.concepts||[]).map((concept,index)=>({chapter,index,id:concept.id,title:concept.title})));
  assert.deepEqual(steps.filter(step=>step.kind==='concept').map(step=>({chapter:step.chapter,index:step.concept,id:step.id.split('--concept-')[1],title:step.title})),expected,`week ${week}`);
  assert.equal(steps.filter(step=>step.kind==='points').length,guide.sections.filter(section=>section.points.length).length);
  assert.equal(steps.filter(step=>step.kind==='code').length,guide.example.code?1:0);
  for(let chapter=0;chapter<=guide.sections.length;chapter++)assert.equal(resolveStudyStep(`#chapter-${chapter}`,steps),steps.find(step=>step.chapter===chapter)?.id);
  for(const id of ['self-check','study-notes','study-resources'])assert.equal(resolveStudyStep('#'+id,steps),id);
 }
 assert.equal(studySteps({...guides[1],exercise:exercises[1]}).length,37);
});

test('optional and alternative content is not fabricated or silently discarded',()=>{
 const guide=structuredClone(guides[1]);delete guide.example.concepts;delete guide.example.code;
 assert.equal(studySteps(guide).filter(step=>step.kind==='steps').length,1);
 assert.equal(resolveStudyStep('#practical-exercise',studySteps(guide)),undefined);
 assert.equal(resolveStudyStep('#unknown',studySteps(guide)),undefined);
 const repeated=structuredClone(guides[1]);repeated.sections[0].concepts.push(repeated.sections[0].concepts[0]);
 assert.throws(()=>studySteps(repeated),/duplicado/);
 assert.notEqual(resolveStudyStep('#chapter-0--concept-error',studySteps(guides[1])),resolveStudyStep('#chapter-3--concept-error',studySteps(guides[1])));
});
