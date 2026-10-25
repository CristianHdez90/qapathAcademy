import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {validatedPractice} from './helpers/practice-evidence.mjs';
const require=createRequire(import.meta.url),ts=require('typescript'),module={exports:{}};
new Function('module','exports','require',ts.transpileModule(readFileSync(new URL('../apps/web/src/features/practice/bug-evidence.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(module,module.exports,()=>require('../libs/progress/dist/index.js'));
test('bug report export includes real reproduction, both retests, transitions and regression without inventing reflections',()=>{
 const source=JSON.parse(validatedPractice(5)).execution.source,text=module.exports.buildBugEvidenceMarkdown(source,['El fallo afecta el saldo.','','','','',''],['Hallazgo','Entorno','Pasos','Esperado','Obtenido','Decisiones']);assert.match(text,/Resultado esperado: 150/);assert.match(text,/Resultado obtenido: 195/);assert.match(text,/Retest 1: esperado 150; obtenido 195/);assert.match(text,/Retest 2: esperado 150; obtenido 150/);assert.match(text,/Importe 100; esperado 100; obtenido 100/);assert.match(text,/Verificado → Cerrado/);assert.match(text,/Sin respuesta todavía/);assert.match(text,/El fallo afecta/);assert.match(module.exports.buildBugEvidenceMarkdown('{}',[],[]),/Todavía no hay una misión/);
});
