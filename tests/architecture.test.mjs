import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url);
function sourceFiles(dir){const out=[];for(const entry of readdirSync(dir,{withFileTypes:true})){
 const f=join(dir,entry.name);if(entry.isDirectory())out.push(...sourceFiles(f));
 else if(/\.(tsx?|jsx?)$/.test(entry.name))out.push(f);
}return out;}
const absolute=p=>fileURLToPath(new URL(p,root));
test('DDD: Domain y Application no importan frameworks ni infraestructura',()=>{
 for(const context of ['learning','identity','progress','administration']){
  for(const layer of ['domain','application']){
   const dir=absolute(`libs/${context}/src/${layer}`);let sources=[];
   try{sources=sourceFiles(dir);}catch{continue;}
   for(const file of sources){const code=readFileSync(file,'utf8');
    assert.doesNotMatch(code,/from ['"](@nestjs|next|react|drizzle-orm|pg|@qapath\/(content|database))/,
      `${file} introduce dependencia prohibida`);
   }
  }
 }
});
test('Hexagonal: interfaz web no importa application/domain ni adaptadores backend',()=>{
 for(const file of sourceFiles(absolute('apps/web/src'))){const code=readFileSync(file,'utf8');
  assert.doesNotMatch(code,/from ['"]@qapath\/(learning|content|database|identity)/,file);
  assert.doesNotMatch(code,/from ['"]@\/modules\//,file);
 }
});
test('Nest solo utiliza composición para enlazar puerto con adaptador',()=>{
 const app=readFileSync(absolute('apps/api/src/app.module.ts'),'utf8');
 assert.match(app,/CONTENT_REPOSITORY/);assert.match(app,/useClass:JsonContentAdapter/);
});
