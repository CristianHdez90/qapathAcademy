import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {emptyProgress,progressPercentage,applyProgressCommand,weekRequirements,fromUnknown}=require('../libs/progress/dist/index.js');
const evidence='Documenté casos de prueba, resultados observados y evidencias de ejecución para validar este reto.';

test('partial activities advance module and route before a week is complete',()=>{
 let state=emptyProgress();const rule=weekRequirements(1);
 assert.equal(progressPercentage(state),0);
 assert.equal(progressPercentage(state,[1,2]),0);
 state=applyProgressCommand(state,{type:'reading-section',week:1,section:0});
 assert.equal(progressPercentage(state,[1,2]),2.5);
 assert.equal(progressPercentage(state),0.2);
 assert.deepEqual(state.weeks,[]);
 assert.equal(progressPercentage(state,[3,4]),0);
 const commands=[
  ...Array.from({length:rule.sections-1},(_,i)=>({type:'reading-section',week:1,section:i+1})),
  ...Array.from({length:rule.tasks},(_,i)=>({type:'submit-evidence',kind:'task',id:`1:${i}`,text:evidence})),
  {type:'lesson-answer',week:1,answer:rule.answer},
  ...rule.labs.map(id=>({type:'submit-evidence',kind:'lab',id,text:evidence})),
  {type:'grade',moduleId:rule.module,score:70},
 ];
 let previous=progressPercentage(state,[1]);
 for(const command of commands){
  state=applyProgressCommand(state,command);
  const next=progressPercentage(state,[1]);assert.ok(next>previous);previous=next;
 }
 assert.equal(progressPercentage(state,[1]),100);
 assert.deepEqual(state.weeks,[1]);
 assert.equal(progressPercentage(fromUnknown(JSON.parse(JSON.stringify(state)))),progressPercentage(state));
});

test('repeated, unknown, manual and non-completion records do not inflate percentages',()=>{
 const state={...emptyProgress(),weeks:[1,2],read:[1],tasks:['1:0'],labs:['l1'],notes:{1:'Texto'},final:[1],quizzes:{fundamentos:69,unknown:100},readingSections:{1:[0,0,999],99:[0]},evidence:{'task:1:0':'breve','task:1:99':evidence}};
 assert.equal(progressPercentage(state,[1,2,2,99]),2.5);
 assert.equal(progressPercentage(state,[]),0);
 assert.equal(progressPercentage(state,0),0);
 assert.equal(progressPercentage(state,[99]),0);
});

test('100 percent requires every activity across the full route',()=>{
 let state=emptyProgress();
 for(let week=1;week<=24;week++){
  const rule=weekRequirements(week);
  for(let section=0;section<rule.sections;section++)state=applyProgressCommand(state,{type:'reading-section',week,section});
  for(let i=0;i<rule.tasks;i++)state=applyProgressCommand(state,{type:'submit-evidence',kind:'task',id:`${week}:${i}`,text:evidence});
  for(const id of rule.labs)state=applyProgressCommand(state,{type:'submit-evidence',kind:'lab',id,text:evidence});
  state=applyProgressCommand(state,{type:'grade',moduleId:rule.module,score:70});
  assert.ok(progressPercentage(state)<100);
  state=applyProgressCommand(state,{type:'lesson-answer',week,answer:rule.answer});
 }
 assert.equal(progressPercentage(state),100);
 assert.equal(state.weeks.length,24);
 const missing={...state,lessonChecks:state.lessonChecks.filter(w=>w!==24)};
 assert.ok(progressPercentage(missing)<100);
});

test('module card shows partial percentage even with zero completed weeks',async()=>{
 const {readFileSync}=await import('node:fs');const {Script,createContext}=await import('node:vm');
 const webRequire=createRequire(new URL('../apps/web/package.json',import.meta.url));
 const React=webRequire('react');const {renderToStaticMarkup}=webRequire('react-dom/server');const ts=require('typescript');
 const load=(file,resolve)=>{
  const module={exports:{}};
  new Script(ts.transpileModule(readFileSync(new URL(file,import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText)
   .runInContext(createContext({module,exports:module.exports,require:resolve}));
  return module.exports;
 };
 const navigation=load('../apps/web/src/features/progress/learning-navigation.ts',webRequire);
 const {ModuleCard}=load('../apps/web/src/components/academy/module-card.tsx',name=>name==='next/link'?{default:({children,...props})=>React.createElement('a',props,children)}:name.includes('learning-navigation')?navigation:webRequire(name));
 const module=require('../libs/content/src/data/catalog.json').modules.find(m=>m.id==='fundamentos');
 const progress=applyProgressCommand(emptyProgress(),{type:'reading-section',week:1,section:0});
 const html=renderToStaticMarkup(React.createElement(ModuleCard,{module,progress,complete:0}));
 assert.match(html,/2\.5%/);assert.match(html,/width:2\.5%/);assert.match(html,/0 \/ 2 semanas completadas/);assert.match(html,/En curso/);
});
