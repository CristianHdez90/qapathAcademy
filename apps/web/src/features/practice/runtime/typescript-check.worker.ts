/// <reference lib="webworker" />
import {checkTypeScript,typeLibraryNames} from './typescript-check';
let libraries:Promise<Record<string,string>>|undefined;
self.onmessage=async(event:MessageEvent<{source:string}>)=>{
 try{
  if(typeof event.data.source!=='string'||event.data.source.length>6000)throw Error('El código supera el límite permitido.');
  libraries??=Promise.all(typeLibraryNames.map(async name=>{const response=await fetch('/practice/typescript/'+name);if(!response.ok)throw Error('No se pudo cargar la biblioteca de tipos.');return [name,await response.text()] as const})).then(Object.fromEntries);
  self.postMessage(checkTypeScript(event.data.source,await libraries));
 }catch(error){libraries=undefined;self.postMessage({ok:false,output:error instanceof Error?error.message:'No se pudo comprobar TypeScript.'})}
};
