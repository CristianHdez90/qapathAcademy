import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {emptyProgress,applyProgressCommand,fromUnknown,weekRequirements,QUIZ_PASS_PERCENT}=require('../libs/progress/dist/index.js');
const {progressCommandSchema}=require('../packages/contracts/dist/index.js');
const catalog=require('../libs/content/src/data/catalog.json');
const guides=require('../libs/content/src/data/study-guides.json');
const evidence='Analicé los casos positivos y negativos, registré resultados y documenté los riesgos encontrados.';

test('completion rules match all 24 lessons and their module labs, task count and assessment answers',()=>{
 for(const week of catalog.weeks){
  const rule=weekRequirements(week.id),guide=guides[week.id];
  assert.equal(rule.module,week.module);assert.equal(rule.sections,guide.sections.length+1);
  assert.equal(rule.tasks,week.tasks.length);assert.equal(rule.answer,guide.question.correct);assert.equal(rule.options,guide.question.options.length);
  assert.deepEqual([...rule.labs],catalog.labs.filter(l=>l.module===week.module).map(l=>l.id));
 }
});

test('week completion requires reading, submitted tasks, passed lesson check, labs and passed module quiz',()=>{
 let state=emptyProgress();const rule=weekRequirements(1);
 const record=command=>{state=applyProgressCommand(state,command)};
 for(let section=0;section<rule.sections;section++)record({type:'reading-section',week:1,section});
 assert.deepEqual(state.read,[1]);assert.deepEqual(state.weeks,[]);
 record({type:'lesson-answer',week:1,answer:(rule.answer+1)%rule.options});assert.deepEqual(state.lessonChecks,[]);
 record({type:'lesson-answer',week:1,answer:rule.answer});
 for(let i=0;i<rule.tasks;i++)record({type:'submit-evidence',kind:'task',id:`1:${i}`,text:evidence});
 record({type:'grade',moduleId:rule.module,score:QUIZ_PASS_PERCENT-1});
 for(const id of rule.labs)record({type:'submit-evidence',kind:'lab',id,text:evidence});
 assert.deepEqual(state.weeks,[]);
 record({type:'grade',moduleId:rule.module,score:QUIZ_PASS_PERCENT});assert.deepEqual(state.weeks,[1]);
 record({type:'grade',moduleId:rule.module,score:10});assert.deepEqual(state.weeks,[1]);
 record({type:'reading-section',week:1,section:0});assert.deepEqual(state.weeks,[1]);assert.equal(state.readingSections['1'].length,4);
 assert.deepEqual(fromUnknown(JSON.parse(JSON.stringify(state))).weeks,[1]);
});

test('legacy flags do not confer completion and manual progress or fabricated grades are rejected by the API schema',()=>{
 const old=fromUnknown({weeks:[1,2],read:[1],tasks:['1:0','1:1'],labs:['l1'],notes:{1:'Nota existente'},quizzes:{fundamentos:100}});
 assert.deepEqual(old.weeks,[]);assert.deepEqual(old.read,[]);assert.deepEqual(old.tasks,[]);assert.deepEqual(old.labs,[]);
 assert.equal(old.notes['1'],'Nota existente');assert.equal(old.quizzes.fundamentos,100);
 for(const key of ['weeks','read','tasks','labs']){
  assert.equal(progressCommandSchema.safeParse({type:'toggle',key,value:1}).success,false);
  assert.throws(()=>applyProgressCommand(emptyProgress(),{type:'toggle',key,value:1}),/manual/);
 }
 assert.equal(progressCommandSchema.safeParse({type:'grade',moduleId:'fundamentos',score:100}).success,false);
 assert.equal(progressCommandSchema.safeParse({type:'lesson-answer',week:1,answer:0,score:100}).success,false);
});

test('invalid lesson sections, task IDs and empty evidence cannot complete activities',()=>{
 for(const command of [{type:'reading-section',week:1,section:4},{type:'lesson-answer',week:25,answer:0},
  {type:'submit-evidence',kind:'task',id:'1:99',text:evidence},{type:'submit-evidence',kind:'lab',id:'unknown',text:evidence},
  {type:'submit-evidence',kind:'task',id:'1:0',text:' '.repeat(100)}])assert.throws(()=>applyProgressCommand(emptyProgress(),command),/inválid/);
});

test('server imports recover notes without trusting imported completion or assessment records',async()=>{
 const apiRequire=createRequire(new URL('../apps/api/package.json',import.meta.url));
 const {readFileSync}=await import('node:fs');const {Script,createContext}=await import('node:vm');
 const ts=require('typescript');const module={exports:{}};
 const source=readFileSync(new URL('../apps/api/src/infrastructure/adapters/postgres-progress.adapter.ts',import.meta.url),'utf8');
 new Script(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,experimentalDecorators:true}}).outputText)
  .runInContext(createContext({module,exports:module.exports,require:name=>name==='../database.provider'?{DatabaseProvider:class {}}:apiRequire(name)}));
 const adapter=new module.exports.PostgresProgressAdapter({});
 adapter.transact=async(_id,change)=>change(emptyProgress());
 const imported=await adapter.import('student',{...emptyProgress(),readingSections:{1:[0,1,2,3]},lessonChecks:[1],quizzes:{fundamentos:100},evidence:{'task:1:0':evidence,'task:1:1':evidence,'lab:l1':evidence},notes:{1:'Notas recuperadas'}});
 assert.equal(imported.notes['1'],'Notas recuperadas');assert.deepEqual(imported.weeks,[]);assert.deepEqual(imported.quizzes,{});assert.deepEqual(imported.read,[]);
});
