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

test('legacy modules keep reading, practice, self-check and a closing test in their last week (D-10)',()=>{
 let state=progress.emptyProgress();const record=cmd=>{state=progress.applyProgressCommand(state,cmd)};const rule=progress.weekRequirements(7);
 assert.equal(nextLearningAction(state,[7,8]).href,'/study/7#chapter-0');
 assert.equal(learningModuleStatus(state,[7,8]),'Sin iniciar');
 for(let section=0;section<rule.sections;section++)record({type:'reading-section',week:7,section});
 assert.equal(nextLearningAction(state,[7,8]).href,'/study/7#practical-exercise');
 assert.equal(learningModuleStatus(state,[7,8]),'En curso');
 record({type:'submit-evidence',kind:'exercise',id:'7',text:validatedPractice(7)});
 assert.equal(nextLearningAction(state,[7,8]).href,'/study/7#self-check');
 record({type:'lesson-answer',week:7,answer:rule.answer});
 assert.equal(nextLearningAction(state,[7,8]).href,'/study/8#closing-test');
 record({type:'grade',moduleId:'herramientas',score:100});
 assert.equal(learningSteps(state,7).every(s=>s.done),true);
 assert.equal(learningSteps(state,7).length,4);
 assert.equal(nextLearningAction(state,[7]),null);
 assert.equal(nextLearningAction(state,[7,8]).week,8);
 assert.equal(learningModuleStatus(state,[7]),'Completado');
 const partial=progress.applyProgressCommand(progress.emptyProgress(),{type:'reading-section',week:7,section:0});
 assert.equal(nextLearningAction(partial,[7]).href,'/study/7#chapter-1');
 assert.equal(learningSteps(partial,7)[0].detail,`1/${rule.sections} secciones`);
});

test('Fundamentos v2 steps follow cards, chapter minitests and practice without module quiz',()=>{
 let state=progress.emptyProgress();const record=cmd=>{state=progress.applyProgressCommand(state,cmd)};const c01=progress.foundationRules[0];
 assert.equal(learningSteps(state,1).map(s=>s.id).join(),'reading,checks,practice');
 assert.equal(nextLearningAction(state,[1,2]).href,'/study/1#FND-W01-C01-T01');
 assert.equal(learningModuleStatus(state,[1,2]),'Sin iniciar');
 record({type:'foundation-card-read',cardId:c01.cards[0]});
 assert.equal(learningModuleStatus(state,[1,2]),'En curso');
 assert.equal(nextLearningAction(state,[1]).href,'/study/1#FND-W01-C01-T02');
 assert.equal(learningSteps(state,1)[0].detail,'1/33 tarjetas leídas');
 for(const card of c01.cards)record({type:'foundation-card-read',cardId:card});
assert.equal(nextLearningAction(state,[1]).href,'/study/1#FND-W01-C02-T01');
 assert.equal(learningSteps(state,1)[1].href,'/study/1#FND-W01-C01-T01');
 for(const id of c01.checks)record({type:'foundation-check-passed',questionId:id});
 assert.equal(learningSteps(state,1)[1].detail,'1/4 capítulos aprobados');
 assert.ok(learningSteps(state,1).every(s=>!s.href.includes('module-quiz')&&!s.href.includes('self-check')));
});
