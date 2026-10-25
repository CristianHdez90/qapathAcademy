import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript'),module={exports:{}};
new Function('module','exports',ts.transpileModule(readFileSync(new URL('../apps/web/src/features/practice/gherkin-lab.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(module,module.exports);
const {buildGherkinFeature,validateGherkinSelection,gherkinExample,emptyGherkinSelection}=module.exports;
test('Gherkin validator rejects missing fields, wrong step roles and out-of-scope actions',()=>{
 assert.equal(validateGherkinSelection(emptyGherkinSelection()).ok,false);
 for(const [key,id] of [['given','request-access'],['when','active-valid'],['then','request-access'],['when','request-password'],['then','ambiguous']])assert.equal(validateGherkinSelection({...gherkinExample,[key]:id}).ok,false,`${key} ${id}`);
});
test('positive and negative examples follow acceptance rules, rather than treating a refusal as a failed test',()=>{
 assert.equal(validateGherkinSelection(gherkinExample).ok,true);
 assert.equal(validateGherkinSelection({...gherkinExample,given:'active-invalid'}).ok,false);
 assert.equal(validateGherkinSelection({...gherkinExample,given:'active-invalid',then:'invalid-credentials'}).ok,true);
 assert.equal(validateGherkinSelection({...gherkinExample,given:'inactive-valid',then:'inactive-account'}).ok,true);
 assert.equal(validateGherkinSelection({...gherkinExample,given:'inactive-invalid',then:'inactive-account'}).ok,true);
});
test('feature export separates the HU description from Scenario and its Gherkin steps',()=>{
 const source=buildGherkinFeature(gherkinExample);assert.match(source,/^Feature: Acceso a mis pedidos\n  Como /);assert.match(source,/\n  Quiero .*\n  Para /);assert.match(source,/\n  Scenario: .*\n    Given .*\n    When .*\n    Then /);assert.doesNotMatch(source,/Given:|When:|Then:/);
 const exercise=JSON.parse(readFileSync(new URL('../libs/content/src/data/practical-exercises.json',import.meta.url),'utf8'))['3'];assert.ok(exercise.files.some(file=>file.href.endsWith('.feature')));assert.equal(exercise.files.some(file=>/matrix|bug/i.test(file.href)),false);
});
