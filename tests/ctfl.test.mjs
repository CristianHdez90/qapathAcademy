import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {Script,createContext} from 'node:vm';
const require=createRequire(import.meta.url),ts=require('typescript');
const module={exports:{}};
new Script(ts.transpileModule(readFileSync(new URL('../apps/web/src/features/certification/ctfl-content.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText).runInContext(createContext({module,exports:module.exports}));
const {ctflQuestions,ctflChapters,gradeCtfl}=module.exports;
const {emptyProgress,fromUnknown,applyProgressCommand,progressPercentage,mergeProgress}=require('../libs/progress/dist/index.js');
const {progressCommandSchema}=require('../packages/contracts/dist/index.js');

test('CTFL bank has unique questions, six chapters, explanations and the 8/6/4/11/9/2 distribution',()=>{
 assert.equal(ctflChapters.length,6);assert.equal(ctflQuestions.length,40);
 assert.equal(new Set(ctflQuestions.map(q=>q.id)).size,40);
 assert.deepEqual(Array.from({length:6},(_,i)=>ctflQuestions.filter(q=>q.chapter===i+1).length),[8,6,4,11,9,2]);
 assert.deepEqual(['K1','K2','K3'].map(level=>ctflQuestions.filter(q=>q.level===level).length),[8,24,8]);
 for(const q of ctflQuestions){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.ok(q.correct>=0&&q.correct<4);assert.ok(q.why.length>35);assert.match(q.objective,/^FL-[1-6]\.\d+\.\d+$/)}
 for(const ch of ctflChapters){assert.ok(ch.sections.length>=2);assert.ok(ch.exercise.length>40);assert.ok(ch.solution.length>60)}
});

test('CTFL grading counts omissions as incorrect and requires 26/40 without rounding up a failure',()=>{
 const answers=Object.fromEntries(ctflQuestions.slice(0,26).map(q=>[q.id,q.correct]));
 assert.equal(gradeCtfl(ctflQuestions,answers).passed,true);assert.equal(gradeCtfl(ctflQuestions,answers).score,26);
 delete answers[ctflQuestions[25].id];assert.equal(gradeCtfl(ctflQuestions,answers).passed,false);
 assert.equal(gradeCtfl(ctflQuestions,{}).score,0);assert.equal(gradeCtfl([],{}).passed,false);
 const all=Object.fromEntries(ctflQuestions.map(q=>[q.id,q.correct]));assert.equal(gradeCtfl(ctflQuestions,all).percent,100);
 const tools=ctflQuestions.filter(q=>q.chapter===6);assert.equal(gradeCtfl(tools,{[tools[0].id]:tools[0].correct}).passed,false);
});

test('certification results round-trip through existing evidence without changing the 24-week route',()=>{
 const text=JSON.stringify({mode:'ctfl-mock',score:26,total:40,percent:65,passed:true,completedAt:'2026-10-24T12:00:00Z'});
 const cmd={type:'submit-evidence',kind:'certification',id:'ctfl-mock',text};
 assert.equal(progressCommandSchema.safeParse(cmd).success,true);
 const original=emptyProgress();const updated=applyProgressCommand(original,cmd);
 assert.equal(progressPercentage(updated),progressPercentage(original));assert.equal(updated.weeks.length,0);
 assert.equal(fromUnknown(updated).evidence['certification:ctfl-mock'],text);
 assert.equal(mergeProgress(emptyProgress(),updated).evidence['certification:ctfl-mock'],text);
 for(let i=1;i<=6;i++)assert.doesNotThrow(()=>applyProgressCommand(updated,{...cmd,id:`ctfl-chapter-${i}`}));
 for(const id of ['ctfl-chapter-0','ctfl-chapter-7','ctfl-admin','mock','ctfl-chapter-01'])assert.throws(()=>applyProgressCommand(updated,{...cmd,id}),/inválida/);
});
