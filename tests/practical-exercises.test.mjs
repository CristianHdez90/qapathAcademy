import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {Script,createContext} from 'node:vm';
import {validatedPractice} from './helpers/practice-evidence.mjs';
const require=createRequire(import.meta.url),ts=require('typescript');
const exercises=JSON.parse(readFileSync(new URL('../libs/content/src/data/practical-exercises.json',import.meta.url)));
const catalog=JSON.parse(readFileSync(new URL('../libs/content/src/data/catalog.json',import.meta.url)));
const {emptyProgress,applyProgressCommand,fromUnknown,weekRequirements,progressPercentage}=require('../libs/progress/dist/index.js');
const {progressCommandSchema}=require('../packages/contracts/dist/index.js');
const module={exports:{}};
new Script(ts.transpileModule(readFileSync(new URL('../apps/api/src/application/practice-sandbox.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText).runInContext(createContext({module,exports:module.exports}));
const {practiceQuote}=module.exports;

test('all 24 weeks get actionable additional practice with expected results and evidence',()=>{
 assert.equal(Object.keys(exercises).length,24);
 for(const week of catalog.weeks){const exercise=exercises[week.id];assert.ok(exercise,week.title);
  assert.ok(exercise.steps.length>=3);assert.ok(exercise.deliverables.length>=2);assert.ok(exercise.rubric.length>=3);
  assert.ok(exercise.setup.length>=2);assert.ok(exercise.tools.length>0);assert.ok(exercise.minutes>=30);
  for(const step of exercise.steps){assert.ok(step.action.length>25);assert.ok(step.expected.length>25)}
  if(exercise.starter)assert.ok(exercise.starter.code.length>100);
 }
 assert.match(exercises[7].steps.map(s=>s.expected).join(' '),/401.*403.*404.*409.*422.*429.*500.*503/);
 assert.match(exercises[21].steps.map(s=>s.expected).join(' '),/npm ci/);
});

test('narrative evidence stays a draft and cannot complete the practice requirement',()=>{
 const evidence='Ejecuté la colección de Postman y adjunté resultados, datos y conclusiones verificables.';
 let state=emptyProgress();
 for(let week=1;week<=24;week++){
  const rule=weekRequirements(week);
  for(let section=0;section<rule.sections;section++)state=applyProgressCommand(state,{type:'reading-section',week,section});
  for(let i=0;i<rule.tasks;i++)state=applyProgressCommand(state,{type:'submit-evidence',kind:'task',id:`${week}:${i}`,text:evidence});
  for(const id of rule.labs)state=applyProgressCommand(state,{type:'submit-evidence',kind:'lab',id,text:evidence});
  state=applyProgressCommand(state,{type:'lesson-answer',week,answer:rule.answer});state=applyProgressCommand(state,{type:'grade',moduleId:rule.module,score:70});
  if(week!==7)state=applyProgressCommand(state,{type:'submit-evidence',kind:'exercise',id:String(week),text:validatedPractice(week)});
 }
 const before=JSON.stringify(state.weeks);state=applyProgressCommand(state,{type:'submit-evidence',kind:'exercise',id:'7',text:evidence});
 assert.equal(JSON.stringify(state.weeks),before);assert.ok(progressPercentage(state)<100);
 assert.equal(fromUnknown(state).evidence['exercise:7'],evidence);
 const cmd={type:'submit-evidence',kind:'exercise',id:'7',text:evidence};assert.equal(progressCommandSchema.safeParse(cmd).success,true);
 for(const id of ['0','25','01','task:7','<script>'])assert.throws(()=>applyProgressCommand(state,{...cmd,id}),/inválida/);
 const onlyExercise=applyProgressCommand(emptyProgress(),cmd);assert.equal(progressPercentage(onlyExercise),0);assert.equal(onlyExercise.weeks.length,0);
});

test('stateless quote contract distinguishes syntax, domain validation, absence and conflict',()=>{
 assert.equal(practiceQuote(null).status,400);
 assert.equal(practiceQuote({productId:'basic',quantity:'3',shipping:'pickup'}).status,400);
 assert.equal(practiceQuote({productId:'basic',quantity:1,shipping:'pickup',userId:'real-user'}).status,400);
 for(const quantity of [0,6,-1,1.5,Infinity,NaN])assert.equal(practiceQuote({productId:'basic',quantity,shipping:'pickup'}).status,422);
 assert.equal(practiceQuote({productId:'missing',quantity:1,shipping:'pickup'}).status,404);
 assert.equal(practiceQuote({productId:'sold-out',quantity:1,shipping:'pickup'}).status,409);
 const cases=JSON.parse(readFileSync(new URL('../apps/web/public/practice/kit/data/quote-cases.json',import.meta.url)));
 for(const item of cases){const {id,expectedStatus,expectedTotal,...input}=item;const actual=practiceQuote(input);assert.equal(actual.status,expectedStatus,id);if(expectedStatus===200)assert.equal(actual.data.total,expectedTotal,id)}
 const result=practiceQuote({productId:'basic',quantity:3,coupon:'QA10',shipping:'delivery'});assert.equal(result.data.discount,10500);assert.equal(result.data.shipping,10000);assert.equal(result.data.total,104500);
});
