import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {validatedPractice} from './helpers/practice-evidence.mjs';
const require=createRequire(import.meta.url);
const {contentSnapshot:{foundation,guides},foundationAnswerKeys:keys}=require('../libs/content/dist/index.js');
const progress=require('../libs/progress/dist/index.js');
const {progressCommandSchema,foundationCheckRequestSchema}=require('../packages/contracts/dist/index.js');
const {GradeFoundationCheck}=require('../libs/learning/dist/index.js');
const {emptyProgress,applyProgressCommand,fromUnknown,foundationRules,progressPercentage}=progress;
const chapters=Object.values(foundation.weeks).flatMap(week=>week.chapters);

test('SPEC-220 v2 publishes eight complete chapters, four per week, 68 cards and 69 checks',()=>{
 assert.deepEqual(Object.keys(foundation.weeks),['1','2']);
 assert.deepEqual(chapters.map(c=>c.id),['FND-C01','FND-C02','FND-C03','FND-C04','FND-C05','FND-C06','FND-C07','FND-C08']);
 for(const week of [1,2])assert.equal(foundation.weeks[week].chapters.length,4);
 assert.deepEqual(chapters.map(c=>c.cards.length),[8,9,8,8,8,10,8,9]);
 assert.equal(chapters.flatMap(c=>c.cards).flatMap(c=>c.checks).length,69);
 const states=chapters.reduce((sum,c)=>sum+c.balloons.states.length,0);assert.equal(states,28);
 for(const c of chapters){
  assert.equal(c.status,'published');assert.ok(c.opening.story.length&&c.objectives.length>=2&&c.teamCase.length>=3&&c.diagram.alternative.length>80&&c.diagram.mermaid&&c.activity.items.length>=4&&c.transfer.rubric.length&&c.closing.glossary.length,c.id);
  for(const s of c.balloons.states)assert.ok(s.actions.length&&s.owner&&s.evidence&&s.result,s.id);
  for(const item of c.activity.items)for(const axis of c.activity.axes)assert.ok(axis.options.some(o=>o.id===item.answers[axis.id]),`${c.id}/${item.id}/${axis.id}`);
  for(const card of c.cards){assert.ok(card.objective&&card.context&&card.explanation&&card.example.situation&&card.example.qaDecision&&card.example.evidence,card.id);assert.ok(card.checks.length>=1&&card.checks.length<=2)}
  for(const source of c.sources)assert.ok(source.url.startsWith('https://')&&source.version&&source.consulted==='2026-10-29');
 }
 assert.match(JSON.stringify(chapters[2]),/Integración de componentes/);assert.match(JSON.stringify(chapters[2]),/Integración de sistemas/);
 assert.match(JSON.stringify(chapters[4]),/paradoja del pesticida/);
 // El contenido anterior de las guías permanece en datos hasta el lote L6 (D-02).
 assert.equal(guides['1'].sections.length,3);
});

test('rules match published content and every public check has a server-only key',()=>{
 for(const rule of foundationRules){
  const chapter=chapters.find(c=>c.id===rule.id);assert.ok(chapter,rule.id);
  assert.deepEqual([...rule.cards],chapter.cards.map(c=>c.id));
  assert.deepEqual([...rule.checks],chapter.cards.flatMap(c=>c.checks.map(q=>q.id)));
 }
 const public_=JSON.stringify(foundation);
 assert.doesNotMatch(public_,/"correct"|"feedback":\{/);
 const ids=new Set();
 for(const check of chapters.flatMap(c=>c.cards).flatMap(c=>c.checks)){
  assert.ok(!ids.has(check.id));ids.add(check.id);
  const key=keys[check.id];assert.ok(key,check.id);
  assert.ok(check.options.some(o=>o.id===key.correct));
  for(const option of check.options)assert.ok(key.feedback[option.id].length>20,`${check.id}/${option.id}`);
 }
 assert.deepEqual(Object.keys(keys).sort(),[...ids].sort());
});

test('grading is server-side; clients cannot send passed checks or fabricate cards',()=>{
 const repo={foundationCheck:id=>chapters.flatMap(c=>c.cards).flatMap(c=>c.checks).find(c=>c.id===id),foundationKey:id=>keys[id]};
 const grade=new GradeFoundationCheck(repo);
 const result=grade.execute('FND-W01-C01-T02-Q1','a');assert.equal(result.correct,true);assert.ok(result.feedback.length>20);
 assert.equal(grade.execute('FND-W01-C01-T02-Q1','b').correct,false);
 assert.throws(()=>grade.execute('FND-W01-C01-T02-Q1','d'));assert.throws(()=>grade.execute('FND-W01-C09-T01-Q1','a'));
 assert.equal(progressCommandSchema.safeParse({type:'foundation-check-passed',questionId:'FND-W01-C01-T01-Q1'}).success,false);
 assert.equal(progressCommandSchema.safeParse({type:'foundation-card-read',cardId:'FND-W01-C01-T01'}).success,true);
 assert.equal(foundationCheckRequestSchema.safeParse({optionId:'b'}).success,true);
 assert.equal(foundationCheckRequestSchema.safeParse({optionId:'b',correct:true}).success,false);
 assert.throws(()=>applyProgressCommand(emptyProgress(),{type:'foundation-card-read',cardId:'FND-W01-C01-T99'}),/Tarjeta de lectura inválida/);
 assert.throws(()=>applyProgressCommand(emptyProgress(),{type:'foundation-check-passed',questionId:'FND-W01-C01-T01-Q1'}),/primero completa la lectura/);
 const imported=fromUnknown({foundationCards:{'FND-W01-C01-T01':true,'FAKE':true},foundationChecks:{'FND-W01-C01-T01-Q1':'yes'}});
 assert.deepEqual(imported.foundationCards,{'FND-W01-C01-T01':true});assert.equal(imported.foundationChecks,undefined);
 const merged=progress.mergeProgress(emptyProgress(),{foundationCards:{'FND-W01-C01-T01':true},foundationChecks:{'FND-W01-C01-T01-Q1':true}});
 assert.equal(merged.foundationChecks,undefined,'checks never merge from another source');
});

test('a chapter passes with ceil(70 %) correct checks on read cards; pending chapters block the week',()=>{
 let state=emptyProgress();const rule=foundationRules[0];
 for(const card of rule.cards)state=applyProgressCommand(state,{type:'foundation-card-read',cardId:card});
 for(const id of rule.checks.slice(0,6))state=applyProgressCommand(state,{type:'foundation-check-passed',questionId:id});
 assert.equal(progress.foundationChapterPassed(state,rule),false,'6/9 < 7');
 state=applyProgressCommand(state,{type:'foundation-check-passed',questionId:rule.checks[6]});
 assert.equal(progress.foundationChapterPassed(state,rule),true);
 state=applyProgressCommand(state,{type:'submit-evidence',kind:'exercise',id:'1',text:validatedPractice(1)});
 assert.deepEqual(state.weeks,[],'C02–C04 still unread');assert.deepEqual(state.read,[]);
 assert.ok(progressPercentage(state,[1])>30&&progressPercentage(state,[1])<100);
 for(const other of foundationRules.filter(r=>r.week===1&&r.id!=='FND-C01')){for(const card of other.cards)state=applyProgressCommand(state,{type:'foundation-card-read',cardId:card});for(const id of other.checks)state=applyProgressCommand(state,{type:'foundation-check-passed',questionId:id})}
 assert.deepEqual(state.read,[1]);assert.deepEqual(state.weeks,[1]);assert.equal(progressPercentage(state,[1]),100);
 assert.deepEqual(state.lessonChecks,[],'no self-check or module quiz needed');
});

test('historically completed weeks stay completed and keep notes and scores (D-03)',()=>{
 const old=fromUnknown({readingSections:{1:[0,1,2,3]},lessonChecks:[1],evidence:{'exercise:1':validatedPractice(1)},quizzes:{fundamentos:100},notes:{1:'Nota histórica'}});
 assert.deepEqual(old.weeks,[1]);assert.deepEqual(old.read,[1]);assert.equal(old.notes['1'],'Nota histórica');assert.equal(old.quizzes.fundamentos,100);
 const partial=fromUnknown({readingSections:{1:[0,1]}});assert.deepEqual(partial.read,[]);assert.equal(partial.foundationCards,undefined);
});
