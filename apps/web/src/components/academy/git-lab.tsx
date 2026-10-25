'use client';
import {useRef,useState} from 'react';
import type LightningFS from '@isomorphic-git/lightning-fs';
import {basicScenario} from '@/features/practice/runtime/browser-scenario';
import type {PracticeRun} from './practice-execution';
const commands={
 'git init':'Crea el repositorio y su rama principal. No crea un commit ni publica nada.',
 'git status':'Compara el archivo de trabajo, el área de preparación y HEAD para saber qué falta añadir o confirmar.',
 'git add caso.md':'Prepara la versión actual de caso.md en el índice. Los cambios posteriores requieren volver a añadirlo.',
 'git diff':'Compara el contenido actual con el último commit. En este laboratorio muestra ambas versiones del archivo.',
 'git commit -m "Agrega caso de prueba"':'Crea un commit real desde el índice, con un identificador SHA. Solo confirma lo preparado.',
 'git log --oneline':'Muestra los commits del repositorio local con su identificador y mensaje.',
 'git switch -c qa/practica':'Crea y selecciona una rama para separar el trabajo de QA.',
 'git branch':'Lista las ramas y señala cuál está seleccionada.'
};
export function GitLab({week,initial,onResult,guided=false}:{week:number;initial?:PracticeRun;guided?:boolean;onResult:(run:PracticeRun)=>void}){
 const fsRef=useRef<LightningFS|null>(null);const [command,setCommand]=useState<keyof typeof commands>('git init'),[content,setContent]=useState(initial?.source||'# TC-01 · Transferencia\nPrecondición: saldo 200\nPaso: transferir 50\nEsperado: saldo 150\n'),[busy,setBusy]=useState(false),[output,setOutput]=useState(initial?.output||'');
 const filesystem=async()=>{if(!fsRef.current){const {default:FS}=await import('@isomorphic-git/lightning-fs');fsRef.current=new FS('qapath-training-git-week-'+week);try{await fsRef.current.promises.mkdir('/repo')}catch(error){if((error as {code?:string}).code!=='EEXIST')throw error}}return fsRef.current};
 const execute=async(save=false)=>{
  setBusy(true);let text='',ok=true;
  try{const fs=await filesystem(),git=await import('isomorphic-git'),base={fs,dir:'/repo'};
   if(save){await fs.promises.writeFile('/repo/caso.md',content,'utf8');text='Archivo caso.md guardado en el área de trabajo. Ejecuta git status para ver su estado.'}
   else if(command==='git init'){await git.init({...base,defaultBranch:'main'});text='Repositorio inicializado en /repo/.git · rama main. Ejecuta Guardar archivo y después git status.'}
   else if(command==='git status'){const current=await git.currentBranch({...base,fullname:false});const matrix=await git.statusMatrix(base);text=`Rama: ${current}\n`+(matrix.length?matrix.map(([path,head,workdir,stage])=>`${path}: HEAD=${head}, trabajo=${workdir}, índice=${stage}\n${head===workdir&&workdir===stage?'Sin cambios':head===0&&stage===0?'Sin seguimiento':workdir===stage?'Preparado para commit':'Cambios sin preparar'}`).join('\n'):'No hay archivos en seguimiento ni cambios detectados.');}
   else if(command==='git add caso.md'){await git.add({...base,filepath:'caso.md'});text='caso.md añadido al índice. Ejecuta git status y luego git commit.'}
   else if(command.startsWith('git commit')){const matrix=await git.statusMatrix(base);if(!matrix.some(([,head,,stage])=>head!==stage))throw Error('No hay cambios preparados para confirmar. Guarda el archivo y ejecuta git add caso.md.');const sha=await git.commit({...base,message:'Agrega caso de prueba',author:{name:'QA de práctica',email:'qa@example.test'}});text=`Commit creado: ${sha}\nAgrega caso de prueba\nComprueba el historial con git log --oneline.`}
   else if(command==='git log --oneline'){const log=await git.log({...base,depth:10});text=log.map(item=>item.oid.slice(0,7)+' '+item.commit.message.trim()).join('\n')}
   else if(command==='git switch -c qa/practica'){await git.branch({...base,ref:'qa/practica',checkout:true});text='Rama qa/practica creada y seleccionada.'}
   else if(command==='git branch'){const current=await git.currentBranch({...base,fullname:false});text=(await git.listBranches(base)).map(ref=>(ref===current?'* ':'  ')+ref).join('\n')||'Todavía no hay ramas con commits.'}
   else{let previous='(sin commit previo)';try{const oid=await git.resolveRef({...base,ref:'HEAD'});previous=new TextDecoder().decode((await git.readBlob({...base,oid,filepath:'caso.md'})).blob)}catch{/* A first file has no HEAD version. */}const working=await fs.promises.readFile('/repo/caso.md','utf8');text=`Versión HEAD:\n${previous}\n\nVersión de trabajo:\n${working}\n\n${previous===working?'Sin diferencias.':'Hay diferencias: revisa y prepara solo los cambios deseados.'}`}
  }catch(error){ok=false;text=error instanceof Error?error.message:'No se pudo ejecutar el comando. Revisa el estado del repositorio.'}
  const result=`$ ${save?'Guardar caso.md':command}\n${text}\n\nPara qué sirve: ${save?'Edita un archivo de la práctica, sin prepararlo ni confirmarlo.':commands[command]}`;setOutput(result);setBusy(false);onResult({mode:'git',source:content,config:basicScenario,endpoint:'',method:'',expectedStatus:0,at:new Date().toISOString(),ok,output:result.slice(0,2500)});
 };
 return <div className="execution-workspace"><h2>Git · comandos y respuestas del repositorio de práctica</h2><p>Repositorio Git real, aislado en este navegador, con datos ficticios. Las operaciones usan isomorphic-git; no abren una terminal del servidor ni modifican tu proyecto. No hay remotos ni publicación.</p>{guided&&<><ol className="tools-git-roadmap"><li>Inicializa el repositorio con init.</li><li>Guarda caso.md y consulta status.</li><li>Prepara el archivo con add y confirma con commit.</li><li>Consulta log y compara el SHA del commit.</li></ol><div className="tools-challenge-cards" role="group" aria-label="Secuencia sugerida de Git">{Object.keys(commands).slice(0,6).map(cmd=><button type="button" className="button button-outline" disabled={busy} key={cmd} onClick={()=>setCommand(cmd as keyof typeof commands)}>{cmd}</button>)}</div><p className="hint">Seleccionar un comando lo prepara. Ejecutar comando Git muestra su respuesta real. Guardar archivo no sustituye git add ni git commit.</p></>}<label>Archivo caso.md<textarea className="execution-editor" aria-label="Contenido del archivo Git" maxLength={4000} value={content} onChange={e=>setContent(e.target.value)} disabled={busy}/></label><button type="button" className="button button-outline" disabled={busy} onClick={()=>void execute(true)}>Guardar archivo de práctica</button><label>Comando Git<select aria-label="Comando Git" value={command} disabled={busy} onChange={e=>setCommand(e.target.value as keyof typeof commands)}>{Object.keys(commands).map(cmd=><option key={cmd}>{cmd}</option>)}</select></label><p><b>Para qué sirve:</b> {commands[command]}</p><button type="button" className="button button-primary" disabled={busy} onClick={()=>void execute()}>{busy?'Ejecutando…':'Ejecutar comando Git'}</button>{output&&<pre className="execution-output" aria-label="Respuesta del comando Git">{output}</pre>}</div>;
}
