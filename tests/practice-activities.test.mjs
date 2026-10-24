import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,existsSync} from 'node:fs';
import {Script,createContext} from 'node:vm';
const require=createRequire(import.meta.url),ts=require('typescript');
function readTypescript(relative){const module={exports:{}};new Script(ts.transpileModule(readFileSync(new URL(relative,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText).runInContext(createContext({module,exports:module.exports}));return module.exports}
const {activityProfiles}=readTypescript('../apps/web/src/features/practice/activity-fields.ts');
const {ctflSupplements,ctflTemplates}=readTypescript('../apps/web/src/features/certification/ctfl-supplements.ts');
test('every week has a dedicated workspace and SQL does not require the browser sandbox',()=>{
 assert.equal(Object.keys(activityProfiles).length,24);assert.equal(new Set(Object.values(activityProfiles).map(p=>p.workspace)).size,24);
 for(let week=1;week<=24;week++){const profile=activityProfiles[week];assert.ok(profile.fields.length>=3);assert.ok(new Set(profile.fields).size===profile.fields.length);assert.equal(typeof profile.lab,'boolean')}
 assert.equal(activityProfiles[8].lab,false);assert.equal(activityProfiles[21].lab,false);assert.equal(activityProfiles[7].lab,true);
 assert.ok(activityProfiles[5].fields.includes('Resultado esperado'));assert.ok(activityProfiles[5].fields.includes('Resultado obtenido (observado)'));
});
test('ISTQB supplements and downloadable templates distinguish case definition from execution',()=>{
 for(const template of ctflTemplates)assert.ok(existsSync(new URL('../apps/web/public'+template.href,import.meta.url)),template.href);
 assert.ok(ctflSupplements.some(s=>s.title.includes('Mike Cohn')));assert.ok(ctflSupplements.some(s=>s.title.includes('Release y deploy')));
 const definition=readFileSync(new URL('../apps/web/public/practice/templates/xray-manual-tests.csv',import.meta.url),'utf8');
 const execution=readFileSync(new URL('../apps/web/public/practice/templates/test-execution.csv',import.meta.url),'utf8');
 assert.match(definition,/TCID,Test Summary,Description,Action,Data,Expected Result/);assert.doesNotMatch(definition,/Resultado obtenido/);assert.match(execution,/Resultado obtenido \(observado\)/);
});
