"use client";
import {createContext,useCallback,useContext,useEffect,useMemo,useRef,useState} from 'react';
import type {ReactNode} from 'react';
import {BrowserProgressRepository} from './infrastructure/browser-progress-repository';
import {emptyProgress,fromUnknown,applyProgressCommand} from '@qapath/progress';
import type {Progress,ProgressCommand,Collection} from '@qapath/progress';
import {useAuth} from '../auth/auth-provider';
type ProgressContext={
 state:Progress;ready:boolean;syncError:string;remote:boolean;
 saveStates:Record<string,{state:'saving'|'saved'|'error'}>;retrySave:(key:string)=>Promise<boolean>;
 toggle:(key:Collection,value:number|string)=>void;
 saveNote:(week:number,note:string)=>void;flushNote:()=>void;
 saveGrade:(moduleId:string,score:number)=>void;
 saveScrum:(score?:number)=>void;
 toggleScrumIntro:()=>void;
 recordLearning:(command:Extract<ProgressCommand,{type:'reading-section'|'lesson-answer'|'submit-evidence'}>)=>Promise<boolean>;
 exportJson:()=>void;importJson:(file:File)=>Promise<void>;
 importDeviceProgress:()=>Promise<void>;refreshProgress:()=>Promise<void>;
};
const Context=createContext<ProgressContext|null>(null);
function actionKey(cmd:ProgressCommand){
 if(cmd.type==='note')return `note:${cmd.week}`;
 if(cmd.type==='submit-evidence')return `evidence:${cmd.kind}:${cmd.id}`;
 if(cmd.type==='lesson-answer')return `lesson:${cmd.week}`;
 if(cmd.type==='reading-section')return `reading:${cmd.week}:${cmd.section}`;
 return cmd.type;
}
async function remoteProgress(method:'GET'|'PATCH'|'POST',command?:unknown):Promise<Progress>{
 const url=method==='POST'?'/api/v1/me/progress/import':'/api/v1/me/progress';
 const response=await fetch(url,{method,headers:{Accept:'application/json',...(command?{'Content-Type':'application/json'}:{})},body:command?JSON.stringify(command):undefined,cache:'no-store',credentials:'same-origin'});
 if(!response.ok)throw new Error(`No se pudo guardar en PostgreSQL (HTTP ${response.status}). Reintenta la operación.`);
 const result=await response.json() as {data:Progress};return fromUnknown(result.data);
}
export function ProgressProvider({children}:{children:ReactNode}){
 const {user}=useAuth();
 // Cada identidad tiene su propio estado y cola; el progreso anterior no se reutiliza al cambiar de sesión.
 return <SessionProgressProvider key={user?`${user.id}:${user.role}`:'guest'}>{children}</SessionProgressProvider>;
}
function SessionProgressProvider({children}:{children:ReactNode}){
 const {user,loading}=useAuth();const repository=useMemo(()=>new BrowserProgressRepository(),[]);
 const userId=user?.id;const role=user?.role;
 const [state,setState]=useState<Progress>(emptyProgress);const [ready,setReady]=useState(false);
 const [syncError,setSyncError]=useState('');const queue=useRef<Promise<unknown>>(Promise.resolve());
 const [saveStates,setSaveStates]=useState<ProgressContext['saveStates']>({});
 const retries=useRef(new Map<string,ProgressCommand>());
 const activeSession=useRef(true);
 useEffect(()=>{activeSession.current=true;return()=>{activeSession.current=false}},[]);
 const notesTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const pendingNote=useRef<{week:number;note:string}|null>(null);
 useEffect(()=>{
  let alive=true;
  if(loading)return;
  const progress=role==='STUDENT'?remoteProgress('GET'):Promise.resolve(userId?emptyProgress():repository.read());
  void progress.then(value=>{if(alive)setState(value)}).catch(e=>{if(alive)setSyncError(e instanceof Error?e.message:'Error al cargar progreso')}).finally(()=>{if(alive)setReady(true)});
  return()=>{alive=false;if(notesTimer.current)clearTimeout(notesTimer.current)};
 },[loading,userId,role,repository]);
 const send=useCallback(async(cmd:ProgressCommand)=>{
  if(!activeSession.current||!ready||user&&user.role!=='STUDENT')return false;
  const key=actionKey(cmd);retries.current.set(key,cmd);
  setSaveStates(old=>({...old,[key]:{state:'saving'}}));
  setSyncError('');
  // Serializamos las mutaciones: todas se ejecutan en el servidor contra el usuario autenticado.
  const work=queue.current.catch(()=>undefined).then(async()=>{
   if(!activeSession.current)return false;
   try{
    const saved=user?.role==='STUDENT'?await remoteProgress('PATCH',cmd):applyProgressCommand(repository.read(),cmd);
    if(!user)repository.save(saved);
    setState(old=>{
     const pending=pendingNote.current;
     const notes={...saved.notes};
     // An unrelated successful action must not erase a note whose save failed.
     for(const retry of retries.current.values())if(retry.type==='note'&&retry!==cmd)notes[retry.week]=old.notes[String(retry.week)]??retry.text;
     if(pending)notes[pending.week]=pending.note;
     return {...saved,notes};
    });
    if(retries.current.get(key)===cmd){setSaveStates(old=>({...old,[key]:{state:'saved'}}));retries.current.delete(key);}
    return true;
   }catch(e){
    if(retries.current.get(key)===cmd){setSaveStates(old=>({...old,[key]:{state:'error'}}));setSyncError(e instanceof Error?e.message:'No fue posible guardar.');}
    return false;
   }
  });
  queue.current=work;return work;
 },[user,repository,ready]);
 const retrySave=useCallback(async(key:string)=>{const cmd=retries.current.get(key);return cmd?send(cmd):false},[send]);
 const toggle=useCallback((key:Collection,value:number|string)=>send({type:'toggle',key,value} as ProgressCommand),[send]);
 const saveNote=useCallback((week:number,note:string)=>{
  if(user?.role!=='STUDENT'){send({type:'note',week,text:note});return;}
  setState(old=>applyProgressCommand(old,{type:'note',week,text:note}));
  setSaveStates(old=>({...old,[`note:${week}`]:{state:'saving'}}));
  if(notesTimer.current)clearTimeout(notesTimer.current);pendingNote.current={week,note};
  notesTimer.current=setTimeout(()=>{const pending=pendingNote.current;pendingNote.current=null;if(pending)send({type:'note',week:pending.week,text:pending.note})},650);
 },[user,send]);
 const refreshProgress=useCallback(async()=>{await queue.current;if(user?.role==='STUDENT'){const saved=await remoteProgress('GET');setState(old=>pendingNote.current?{...saved,notes:old.notes}:saved);setSyncError('')}},[user]);
 const flushNote=useCallback(()=>{if(notesTimer.current)clearTimeout(notesTimer.current);const pending=pendingNote.current;pendingNote.current=null;if(pending)send({type:'note',week:pending.week,text:pending.note});},[send]);
 const saveGrade=useCallback((moduleId:string,score:number)=>{if(user?.role==='STUDENT')void refreshProgress().catch(e=>setSyncError(String(e)));else send({type:'grade',moduleId,score})},[send,user,refreshProgress]);
 const saveScrum=useCallback((score=0)=>{if(!user)send({type:'scrum-grade',score});},[send,user]);
 const toggleScrumIntro=useCallback(()=>send({type:'scrum-intro'}),[send]);
 const exportJson=useCallback(()=>{
  const data=JSON.stringify({app:'QAPath Academy',exportedAt:new Date().toISOString(),...state},null,2);
  const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='qapath-progreso.json';a.click();URL.revokeObjectURL(url);
 },[state]);
 const importClean=useCallback(async(raw:unknown)=>{
  if(!raw||typeof raw!=='object'||!Array.isArray((raw as Record<string,unknown>).weeks))throw new Error('Archivo incompatible.');
  const cleaned=fromUnknown(raw);
  if(user?.role==='STUDENT'){const saved=await remoteProgress('POST',cleaned);setState(saved)}
  else{repository.save(cleaned);setState(cleaned)}
 },[user,repository]);
 const importJson=useCallback(async(file:File)=>{
  if(file.size>500_000)throw new Error('El archivo excede 500 KB');
  let data:unknown;try{data=JSON.parse(await file.text())}catch{throw new Error('JSON inválido')}
  await importClean(data);
 },[importClean]);
 const importDeviceProgress=useCallback(async()=>{if(user?.role!=='STUDENT')throw new Error('Solo los estudiantes sincronizan su progreso');await importClean(repository.read())},[user,repository,importClean]);
 return <Context.Provider value={{state,ready,syncError,remote:user?.role==='STUDENT',saveStates,retrySave,toggle,recordLearning:send,saveNote,flushNote,saveGrade,saveScrum,toggleScrumIntro,exportJson,importJson,importDeviceProgress,refreshProgress}}>{syncError&&<div className="sync-alert" role="alert"><span>⚠ {syncError}</span><button type="button" onClick={()=>{
  const failed=Object.entries(saveStates).filter(([,s])=>s.state==='error').map(([key])=>key);
  if(failed.length)void Promise.all(failed.map(retrySave));else void refreshProgress().catch(e=>setSyncError(e instanceof Error?e.message:'No se pudo cargar el avance.'));
 }}>Reintentar sincronización</button></div>}{children}</Context.Provider>;
}
export function useProgress(){const value=useContext(Context);if(!value)throw new Error('ProgressProvider ausente');return value;}
