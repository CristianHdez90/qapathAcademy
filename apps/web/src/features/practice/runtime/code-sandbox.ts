export async function executeCode(code:string,typescript:boolean):Promise<{ok:boolean;output:string}>{
 let javascript=code;
 if(typescript){
  const ts=await import('typescript');
  const result=ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None},reportDiagnostics:true});
  const errors=result.diagnostics?.filter(d=>d.category===ts.DiagnosticCategory.Error);
  if(errors?.length)return {ok:false,output:errors.map(d=>ts.flattenDiagnosticMessageText(d.messageText,'\n')).join('\n')};
  javascript=result.outputText;
 }
 return new Promise(resolve=>{
  const frame=document.createElement('iframe');frame.hidden=true;frame.sandbox.add('allow-scripts');
  const token=crypto.randomUUID();
  const finish=(result:{ok:boolean;output:string})=>{clearTimeout(timer);window.removeEventListener('message',receive);frame.remove();resolve(result)};
  const receive=(event:MessageEvent)=>{if(event.source!==frame.contentWindow||event.data?.token!==token)return;const result=event.data.result;if(typeof result?.ok==='boolean'&&typeof result.output==='string')finish({ok:result.ok,output:result.output.slice(0,16000)})};
  window.addEventListener('message',receive);const timer=setTimeout(()=>finish({ok:false,output:'Ejecución detenida: se superó el límite de 3 segundos.'}),3500);
  // An opaque-origin iframe gives its worker a network-denying CSP. User code never runs in the application origin.
  const worker=`const lines=[];let checks=0;const write=(...args)=>{if(lines.length<60)lines.push(args.map(x=>typeof x==='string'?x:JSON.stringify(x)).join(' ').slice(0,1000))};console.log=write;console.error=write;console.warn=write;const assert=(condition,message='Aserción fallida')=>{checks++;if(!condition)throw new Error(message);write('✓ '+message)};console.assert=assert;Promise.resolve().then(async()=>{${javascript}\n}).then(()=>postMessage({ok:true,output:lines.join('\\n')+'\\nAserciones ejecutadas: '+checks}),error=>postMessage({ok:false,output:lines.join('\\n')+'\\n'+error.name+': '+error.message}));`;
  const script=`const worker=new Worker(URL.createObjectURL(new Blob([${JSON.stringify(worker)}],{type:'text/javascript'})));worker.onmessage=e=>{parent.postMessage({token:${JSON.stringify(token)},result:e.data},'*');worker.terminate()};worker.onerror=()=>{parent.postMessage({token:${JSON.stringify(token)},result:{ok:false,output:'No se pudo ejecutar el código aislado.'}},'*');worker.terminate()};setTimeout(()=>worker.terminate(),3000);`;
  frame.srcdoc=`<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; worker-src blob:; connect-src 'none'"><script>${script.replace(/<\/script/gi,'<\\/script')}</script>`;
  document.body.append(frame);
 });
}
