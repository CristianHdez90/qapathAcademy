import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {Script,createContext} from 'node:vm';
import {validatedPractice} from './helpers/practice-evidence.mjs';
const require=createRequire(import.meta.url),ts=require('typescript');
const progress=require('../libs/progress/dist/index.js');
const module={exports:{}};
new Script(ts.transpileModule(readFileSync(new URL('../apps/web/src/features/progress/learning-navigation.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText)
 .runInContext(createContext({module,exports:module.exports,require:()=>progress}));
const {learningSteps,nextLearningAction,learningModuleStatus}=module.exports;
const evidence='Documenté resultados y riesgos de cada escenario con datos ficticios para validar el flujo.';

test('next action follows the first missing requirement, then advances to the next week',()=>{
 let state=progress.emptyProgress();const record=cmd=>{state=progress.applyProgressCommand(state,cmd)};
 assert.equal(nextLearningAction(state,[1,2]).href,'/study/1#chapter-0');
 assert.equal(learningModuleStatus(state,[1,2]),'Sin iniciar');
 for(let section=0;section<4;section++)record({type:'reading-section',week:1,section});
 assert.equal(nextLearningAction(state,[1,2]).href,'/study/1#practical-exercise');
 assert.equal(learningModuleStatus(state,[1,2]),'En curso');
 for(let i=0;i<2;i++)record({type:'submit-evidence',kind:'task',id:`1:${i}`,text:evidence});
 assert.equal(nextLearningAction(state,[1,2]).href,'/study/1#practical-exercise');
 record({type:'submit-evidence',kind:'exercise',id:'1',text:validatedPractice(1)});
 assert.equal(nextLearningAction(state,[1,2]).href,'/study/1#self-check');
 record({type:'lesson-answer',week:1,answer:progress.weekRequirements(1).answer});
 assert.equal(nextLearningAction(state,[1,2]).href,'/modules/fundamentos#module-quiz');
 record({type:'grade',moduleId:'fundamentos',score:100});
 assert.equal(learningSteps(state,1).every(s=>s.done),true);
 assert.equal(learningSteps(state,1).length,4);
 assert.equal(nextLearningAction(state,[1]),null);
 assert.equal(nextLearningAction(state,[1,2]).week,2);
 assert.equal(learningModuleStatus(state,[1]),'Completado');
});

test('a partly viewed lesson recommends its next unread chapter rather than restarting',()=>{
 const state=progress.applyProgressCommand(progress.emptyProgress(),{type:'reading-section',week:1,section:0});
 assert.equal(nextLearningAction(state,[1]).href,'/study/1#chapter-1');
 assert.equal(learningSteps(state,1)[0].detail,'1/4 secciones');
});
