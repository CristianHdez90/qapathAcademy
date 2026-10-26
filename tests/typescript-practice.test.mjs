import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
const require=createRequire(import.meta.url),ts=require('typescript');
function load(path){const module={exports:{}};new Function('require','module','exports',ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(require,module,module.exports);return module.exports}
const h=load('../apps/web/src/features/practice/typescript-practice.ts'),checker=load('../apps/web/src/features/practice/runtime/typescript-check.ts');
const libraries=Object.fromEntries(checker.typeLibraryNames.map(name=>[name,readFileSync(new URL('../apps/web/public/practice/typescript/'+name,import.meta.url),'utf8')]));
function execute(source){let checks=0;const logs=[];const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;new Script(js).runInNewContext({assert:(condition,message)=>{checks++;assert.ok(condition,message)},console:{log:(...values)=>logs.push(values.join(' '))}},{timeout:1000});return {checks,output:logs.join('\n')+'\nAserciones ejecutadas: '+checks}}
test('TypeScript challenges pass semantic strict checks and runtime assertions except the intentional error',()=>{
 for(const item of h.typeChallenges){const result=checker.checkTypeScript(item.source,libraries);if(item.id==='strict'){assert.equal(result.ok,false);assert.match(result.output,/TS2322/);assert.throws(()=>execute(item.source),/Cantidad numérica/)}else{assert.equal(result.ok,true,result.output);assert.ok(execute(item.source).checks>=2,item.id)}}
 const corrected=h.typeChallenges[1].corrected;assert.equal(checker.checkTypeScript(corrected,libraries).ok,true);assert.equal(execute(corrected).checks,1);
});
test('strict checking catches semantic assignments, unsafe union access and nullable values without execution',()=>{
 for(const source of ["const quantity: number = '3';","type R = {ok:true;data:number}|{ok:false;error:string}; function read(r:R){return r.data;}","function read(value: string | null){return value.length;}"]){assert.equal(checker.checkTypeScript(source,libraries).ok,false)}
 assert.equal(checker.checkTypeScript("throw new Error('not executed');",libraries).ok,true);
 assert.equal(checker.checkTypeScript("import x from 'external-package';",libraries).ok,false);
});
test('evidence needs matching runtime and types, includes diagnostics and fits the existing save limit',()=>{
 const source=h.typeChallenges.at(-1).source,runtime=execute(source),check={...checker.checkTypeScript(source,libraries),at:'2026-10-25T12:00:00Z'},run={mode:'code',source,output:runtime.output,ok:true,at:check.at,typescriptCheck:check};
 assert.equal(h.typePracticeReady(run),true);assert.equal(h.typePracticeReady({...run,typescriptCheck:undefined}),false);assert.equal(h.typePracticeReady({...run,typescriptCheck:{...check,ok:false}}),false);assert.equal(h.typePracticeReady({...run,output:'Solo imprimí datos'}),false);
 const report=h.typeEvidence(run,['Tipos','Datos','Comprobaciones'],['A','B','C']);for(const text of [source,runtime.output,check.output,check.at])assert.ok(report.includes(text));
 const evidence=JSON.stringify({week:11,execution:run,fields:['x'.repeat(1000),'x'.repeat(1000),'x'.repeat(1000)],completion:'draft'});assert.ok(evidence.length<8000,evidence.length);
});
