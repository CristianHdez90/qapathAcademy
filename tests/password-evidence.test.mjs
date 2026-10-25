import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript'),module={exports:{}};
new Function('module','exports','require',ts.transpileModule(readFileSync(new URL('../apps/web/src/features/practice/password-evidence.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(module,module.exports,()=>require('../libs/progress/dist/index.js'));
test('password report includes executed data, separate expected/obtained and partial reflections',()=>{
 const source=JSON.stringify({passwordLabVersion:1,attempts:[{id:'min-below',value:'aaaaaa1',prediction:'accept',at:'2026-10-25T00:00:00Z'}]});const text=module.exports.buildPasswordEvidenceMarkdown(source,['Mi análisis de particiones','',''],['Particiones','Fronteras','Conclusión']);assert.match(text,/predicción\): Aceptar/);assert.match(text,/validador\): Rechazar/);assert.match(text,/aaaaaa1/);assert.match(text,/2026-10-25/);assert.match(text,/Mi análisis/);assert.match(text,/Sin respuesta todavía/);assert.match(text,/0\/7/);
 assert.match(module.exports.buildPasswordEvidenceMarkdown('{}',[],[]),/Todavía no hay una ejecución/);
});
