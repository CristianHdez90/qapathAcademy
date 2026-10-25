import {PGlite} from '@electric-sql/pglite';
self.onmessage=async(event:MessageEvent<{sql:string}>)=>{
 let db:PGlite|undefined;
 try{
  const load=async(name:string)=>{const response=await fetch('/practice/runtime/'+name);if(!response.ok)throw new Error('No se pudo cargar PostgreSQL de práctica.');return response};
  const [pgliteWasmModule,initdbWasmModule,fsBundle,seed]=await Promise.all([
   load('pglite.wasm').then(r=>r.arrayBuffer()).then(b=>WebAssembly.compile(b)),
   load('initdb.wasm').then(r=>r.arrayBuffer()).then(b=>WebAssembly.compile(b)),
   load('pglite.data').then(r=>r.blob()),fetch('/practice/kit/data/training.sql').then(r=>r.text())
  ]);
  db=new PGlite({pgliteWasmModule,initdbWasmModule,fsBundle});await db.waitReady;
  await db.exec(seed.split('-- Q1')[0]);
  await db.exec("SET statement_timeout='3000ms'");
  const result=await db.query(event.data.sql);
  self.postMessage({ok:true,output:JSON.stringify({columns:result.fields.map(f=>f.name),rows:result.rows.slice(0,100),rowCount:result.rows.length,limit:100},null,2)});
 }catch(error){self.postMessage({ok:false,output:error instanceof Error?error.message:'Error SQL.'})}
 finally{await db?.close()}
};
