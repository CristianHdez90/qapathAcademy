'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import {useAuth,AuthApiError} from '@/features/auth/auth-provider';
import './qa-assistant.css';
import {studySuggestions} from './study-suggestions';
import {ASK_LIA_EVENT} from './ask-lia';

type Message={role:'user'|'assistant';content:string};
type Conversation={id:string;title:string;messages:Message[];revision:number;archived:boolean;updatedAt:string};
type Summary=Omit<Conversation,'messages'>;
type HistoryPage={items:Summary[];nextOffset:number|null};
async function assistantRequest<T>(url:string,init:RequestInit={}){
 const response=await fetch('/api/v1/assistant/'+url,{...init,credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json',...init.headers}});
 const body=await response.json() as {data:T;message?:string;error?:{message?:string}};
 if(!response.ok)throw new AuthApiError(response.status,response.status===401?'Tu sesión venció. Vuelve a iniciar sesión.':body.message||body.error?.message||'No se pudo guardar o cargar la conversación.');
 return body.data;
}
const suggestions=[['Casos de prueba','Ayúdame a diseñar casos de prueba para un formulario de inicio de sesión.'],['Reportar un bug','Enséñame a escribir un reporte de bug claro, con un ejemplo.'],['Playwright','Explícame cómo automatizar una prueba de login con Playwright y TypeScript.'],['Pruebas de API','¿Qué debo validar al probar una API REST?']];

function Ladybug(){return <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
 <path d="m24 16-5-7m21 7 5-7M15 30l-7-4m7 17-7 4m41-17 7-4m-7 17 7 4M23 53l-4 6m22-6 4 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
 <ellipse cx="32" cy="20" rx="12" ry="10" fill="#14283c"/><ellipse cx="32" cy="38" rx="21" ry="22" fill="#ff716d" stroke="#14283c" strokeWidth="2"/>
 <path d="M32 17v43" stroke="#14283c" strokeWidth="2"/><circle cx="22" cy="31" r="4" fill="#14283c"/><circle cx="43" cy="37" r="4.5" fill="#14283c"/><circle cx="22" cy="47" r="4.5" fill="#14283c"/><circle cx="40" cy="51" r="3" fill="#14283c"/>
 <circle cx="28" cy="16" r="2" fill="white"/><circle cx="36" cy="16" r="2" fill="white"/>
 <path d="m17 23 7-3" stroke="#ffb8a5" strokeWidth="3" strokeLinecap="round"/>
 </svg>}

/** React text nodes only: generated HTML is never executed. */
function Answer({text}:{text:string}){
 return <>{text.split(/(```[\s\S]*?```)/g).map((part,i)=>part.startsWith('```')?
  <pre key={i}><code>{part.slice(3,-3).replace(/^[\w+-]*\n/,'')}</code></pre>:<span key={i}>{part}</span>)}</>;
}

export function QaAssistant(){
 const {user,loading}=useAuth();const [open,setOpen]=useState(false);
 // Remount and cancel requests when the identity changes; server history is scoped to that identity.
 return <AssistantChat key={user?.id||'guest'} signedIn={!!user} authLoading={loading} open={open} setOpen={setOpen}/>;
}
function AssistantChat({signedIn,authLoading,open,setOpen}:{signedIn:boolean;authLoading:boolean;open:boolean;setOpen:(open:boolean)=>void}){
 const path=usePathname();
 const [messages,setMessages]=useState<Message[]>([]),[draft,setDraft]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [obscuresFocus,setObscuresFocus]=useState(false),[maximized,setMaximized]=useState(false);
 const [conversation,setConversation]=useState<Conversation|null>(null),[history,setHistory]=useState<Summary[]>([]),[historyOpen,setHistoryOpen]=useState(false),[archivedView,setArchivedView]=useState(false),[historyBusy,setHistoryBusy]=useState(signedIn),[nextOffset,setNextOffset]=useState<number|null>(null);
 useEffect(()=>{
  if(!signedIn||authLoading)return;
  const controller=new AbortController();let active=true;
  void (async()=>{
   try{
    const page=await assistantRequest<HistoryPage>('conversations',{signal:controller.signal});
    if(!active)return;setHistory(page.items);setNextOffset(page.nextOffset);
    const recent=page.items.find(item=>!item.archived);
    if(recent){const saved=await assistantRequest<Conversation>('conversations/'+recent.id,{signal:controller.signal});if(active){setConversation(saved);setMessages(saved.messages)}}
   }catch(e){if(active){setError(e instanceof Error?e.message:'No se pudo recuperar el historial.');setHistoryOpen(true)}}
   finally{if(active)setHistoryBusy(false)}
  })();
  return()=>{active=false;controller.abort()};
 },[signedIn,authLoading]);
 const trigger=useRef<HTMLButtonElement>(null),input=useRef<HTMLTextAreaElement>(null),bottom=useRef<HTMLDivElement>(null),pending=useRef<AbortController|null>(null);
 const returnFocus=useRef<HTMLElement|null>(null);
 const close=()=>{setOpen(false);setMaximized(false);requestAnimationFrame(()=>(returnFocus.current?.isConnected?returnFocus.current:trigger.current)?.focus())};
 useEffect(()=>{
  if(!open||!maximized)return;
  const previous=document.body.style.overflow;document.body.style.overflow='hidden';
  return()=>{document.body.style.overflow=previous};
 },[open,maximized]);
 useEffect(()=>{
  const inspect=()=>{
   const focused=document.activeElement,button=trigger.current;
   if(!(focused instanceof HTMLElement)||!button||focused.closest('.qa-helper')){setObscuresFocus(false);return;}
   const a=focused.getBoundingClientRect(),b=button.getBoundingClientRect();
   setObscuresFocus(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top);
  };
  document.addEventListener('focusin',inspect);window.addEventListener('resize',inspect);
  return()=>{document.removeEventListener('focusin',inspect);window.removeEventListener('resize',inspect)};
 },[]);
 useEffect(()=>{
  const ask=(event:Event)=>{
   const prompt=(event as CustomEvent<{prompt?:unknown}>).detail?.prompt;
   if(typeof prompt!=='string'||!prompt.trim()||prompt.length>2000)return;
   returnFocus.current=document.activeElement instanceof HTMLElement?document.activeElement:null;
   setDraft(prompt);setOpen(true);requestAnimationFrame(()=>input.current?.focus());
  };
  window.addEventListener(ASK_LIA_EVENT,ask);return()=>window.removeEventListener(ASK_LIA_EVENT,ask);
 },[setOpen]);
 useEffect(()=>()=>pending.current?.abort(),[]);
 useEffect(()=>{if(open&&signedIn&&!historyBusy&&!historyOpen&&!conversation?.archived)input.current?.focus()},[open,signedIn,historyBusy,historyOpen,conversation?.archived]);
 useEffect(()=>{if(open)bottom.current?.scrollIntoView({block:'nearest'})},[messages,busy,open,error]);
 async function refreshHistory(offset=0){
  if(busy||historyBusy)return;setHistoryBusy(true);setError('');
  const controller=new AbortController();pending.current=controller;
  try{const page=await assistantRequest<HistoryPage>('conversations?offset='+offset,{signal:controller.signal});setHistory(old=>offset?[...old,...page.items.filter(item=>!old.some(saved=>saved.id===item.id))]:page.items);setNextOffset(page.nextOffset)}
  catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:'No se pudo cargar el historial.')}
  finally{if(pending.current===controller){pending.current=null;setHistoryBusy(false)}}
 }
 function selectConversation(saved:Conversation){setConversation(saved);setMessages(saved.messages);setDraft('');setError('');setHistoryOpen(false)}
 async function openConversation(id:string){
  if(busy||historyBusy)return;setHistoryBusy(true);setError('');
  const controller=new AbortController();pending.current=controller;
  try{selectConversation(await assistantRequest<Conversation>('conversations/'+id,{signal:controller.signal}))}
  catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:'No se pudo abrir la conversación.')}
  finally{if(pending.current===controller){pending.current=null;setHistoryBusy(false)}}
 }
 async function archiveConversation(){
  if(!conversation||busy||historyBusy)return;setHistoryBusy(true);setError('');
  const controller=new AbortController();pending.current=controller;
  try{
   const saved=await assistantRequest<Conversation>('conversations/'+conversation.id,{method:'PATCH',signal:controller.signal,body:JSON.stringify({archived:!conversation.archived})});
   setConversation(saved);setHistory(old=>[saved,...old.filter(item=>item.id!==saved.id)]);
  }catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:'No se pudo archivar la conversación.')}
  finally{if(pending.current===controller){pending.current=null;setHistoryBusy(false)}}
 }
 function newConversation(){setConversation(null);setMessages([]);setDraft('');setError('');setHistoryOpen(false);input.current?.focus()}
 async function send(text=draft){
  if(!text.trim()||busy||historyBusy||conversation?.archived||!signedIn)return;
  // Keep the complete transcript on screen; bound only the context sent to Gemini.
  const history=[...messages.slice(-4).map(m=>({...m,content:m.content.slice(0,3000)})),{role:'user' as const,content:text.trim()}];
  const fullHistory=[...messages,{role:'user' as const,content:text.trim()}];
  setMessages(fullHistory);setDraft('');setError('');setBusy(true);
  const controller=new AbortController();pending.current=controller;
  const timer=setTimeout(()=>controller.abort(),35000);
  try{
   const safePath=/^\/(?:modules(?:\/[a-zA-Z0-9-]+)?|study\/\d+|scrum|project|resources|account|admin)?$/.test(path)?path:undefined;
   const data=await assistantRequest<{answer:string;truncated?:boolean;conversation?:Conversation}>('chat',{method:'POST',signal:controller.signal,body:JSON.stringify({messages:history,page:safePath,keepHistory:true,...(conversation?{conversationId:conversation.id,revision:conversation.revision}:{})})});
   if(!data.conversation)throw new Error('No se pudo guardar la conversación. Comprueba que la API esté actualizada.');
   const saved=data.conversation;setConversation(saved);setMessages(saved.messages);
   setHistory(old=>[saved,...old.filter(item=>item.id!==saved.id)]);
  }catch(e){
   if(!controller.signal.aborted||pending.current===controller){
    setMessages(messages);setDraft(text);
    setError(controller.signal.aborted?'La consulta tardó demasiado. Puedes volver a enviarla.':e instanceof Error?e.message:'No se pudo conectar con la IA.');
   }
  }finally{clearTimeout(timer);if(pending.current===controller){pending.current=null;setBusy(false)}}
 }
 return <div className={'qa-helper'+(obscuresFocus?' hide-launcher':'')+(open&&maximized?' is-maximized':'')}>
  {open&&<section id="qa-assistant-panel" className="qa-chat" role="dialog" aria-label="MariBug, asistente de QA Engineer" onBlur={e=>{const next=e.relatedTarget;if(next instanceof Node&&!e.currentTarget.contains(next)&&!trigger.current?.contains(next))setOpen(false)}} onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();if(maximized)setMaximized(false);else close()}}}>
   <header className="qa-chat-header"><span className="qa-chat-avatar"><Ladybug/></span><div><h2>MariBug <span>IA</span></h2><p>Tu aliada en QA</p></div><div className="qa-window-controls"><button type="button" className="qa-icon-button" aria-label={maximized?'Restaurar tamaño del chat':'Maximizar chat'} title={maximized?'Restaurar tamaño':'Maximizar chat'} aria-pressed={maximized} onClick={event=>{event.currentTarget.focus();setMaximized(value=>!value)}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">{maximized?<><path d="M8 8V4h12v12h-4"/><rect x="4" y="8" width="12" height="12" rx="1"/></>:<rect x="4" y="4" width="16" height="16" rx="1"/>}</svg></button><button type="button" className="qa-icon-button" onClick={close} aria-label="Cerrar asistente" title="Cerrar asistente">×</button></div></header>
   {signedIn&&<nav className="qa-chat-actions" aria-label="Gestionar conversaciones">
    <button type="button" disabled={busy||historyBusy} onClick={newConversation}>＋ Nueva</button>
    <button type="button" disabled={busy||historyBusy} aria-expanded={historyOpen} onClick={()=>{setHistoryOpen(!historyOpen);if(!historyOpen)void refreshHistory()}}>Historial</button>
    {conversation&&<button type="button" disabled={busy||historyBusy} onClick={()=>void archiveConversation()}>{conversation.archived?'Restaurar':'Archivar'}</button>}
   </nav>}
   <div className="qa-chat-body">
    {signedIn&&historyOpen?<section className="qa-history" aria-label="Historial de conversaciones">
     <h3>Tus conversaciones</h3><div className="qa-history-filters"><button type="button" aria-pressed={!archivedView} onClick={()=>setArchivedView(false)}>Activas</button><button type="button" aria-pressed={archivedView} onClick={()=>setArchivedView(true)}>Archivadas</button></div>
     {history.filter(item=>item.archived===archivedView).map(item=><button type="button" className="qa-history-item" disabled={historyBusy} key={item.id} onClick={()=>void openConversation(item.id)}><strong>{item.title}</strong><small>{new Date(item.updatedAt).toLocaleDateString('es-CO')}{item.archived?' · Archivada':''}</small></button>)}
     {!historyBusy&&!history.some(item=>item.archived===archivedView)&&<p>No hay conversaciones {archivedView?'archivadas':'activas'} en esta página.</p>}
     {nextOffset!==null&&<button type="button" disabled={historyBusy} onClick={()=>void refreshHistory(nextOffset)}>Cargar más conversaciones</button>}
     <button type="button" disabled={historyBusy} onClick={()=>void refreshHistory()}>Actualizar historial</button>
     {historyBusy&&<p role="status">Cargando historial…</p>}{error&&<p className="qa-chat-error" role="alert">{error}</p>}
    </section>:<>
    <div className="qa-intro"><span className="qa-intro-label">ENCUENTRA EL SIGUIENTE PASO</span><h3>¡Hola! Soy MariBug 🐞.</h3><p>Tu aliada para encontrar bugs y construir calidad. ¿Qué vamos a poner a prueba hoy?</p></div>
    {signedIn&&conversation&&<p className="qa-current-title">{conversation.title}{conversation.archived?' · Archivada':''}</p>}
    {historyBusy&&<p role="status">Cargando conversación…</p>}
    {!signedIn?<div className="qa-signin"><p>{authLoading?'Comprobando tu sesión…':'Inicia sesión para conversar conmigo y practicar QA.'}</p>{!authLoading&&<Link className="button button-primary" href="/login" onClick={close}>Iniciar sesión ↗</Link>}</div>:<>
     {messages.length===0&&!historyBusy&&<div className="qa-suggestions">{suggestions.map(([label,prompt])=><button key={label} onClick={()=>void send(prompt)} disabled={busy||historyBusy||conversation?.archived}>{label}<span aria-hidden="true">↗</span></button>)}</div>}
     <details className="qa-study-topics"><summary>Explorar módulos y temas de estudio</summary><div>{studySuggestions.map(group=><details key={group.title} className="qa-study-group"><summary>{group.title}</summary><div className="qa-suggestions">{group.questions.map(([label,prompt])=><button key={label} type="button" disabled={busy||historyBusy||conversation?.archived} onClick={()=>void send(prompt)}>{label}<span aria-hidden="true">↗</span></button>)}</div></details>)}</div></details>
     <div className="qa-transcript" role="log" aria-label="Conversación con MariBug" aria-live="polite" aria-relevant="additions">{messages.map((message,i)=><article className={`qa-message qa-message-${message.role}`} key={i}><b>{message.role==='user'?'Tú':'MariBug'}</b><div><Answer text={message.content}/></div></article>)}</div>
     {busy&&<p className="qa-thinking" role="status"><span/> Preparando tu respuesta…</p>}
     {error&&<p className="qa-chat-error" role="alert">{error}</p>}
     <div ref={bottom}/>
    </>}
   </>}
   </div>
   {signedIn&&!historyOpen&&<form className="qa-composer" onSubmit={e=>{e.preventDefault();void send()}}>
    <label className="qa-sr-only" htmlFor="qa-question">Tu pregunta sobre QA</label><div><textarea id="qa-question" ref={input} placeholder="¿Qué vamos a probar hoy?" value={draft} maxLength={2000} rows={2} disabled={busy||historyBusy||conversation?.archived} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();void send()}}}/><button type="submit" disabled={busy||historyBusy||conversation?.archived||!draft.trim()} aria-label="Enviar pregunta">↑</button></div>
    <div className="qa-composer-meta"><span>IA · Revisa sus respuestas. No compartas datos sensibles.</span><span>{conversation?.archived?'Archivada · Restaura para continuar':busy?'Enviando…':conversation?'Guardada en tu cuenta':'Nueva conversación'}</span></div>
    <small>Tu consulta se envía a Google Gemini.</small>
   </form>}
  </section>}
  <button ref={trigger} className={'qa-launcher'+(open?' is-open':'')} type="button" aria-label={open?'Cerrar asistente MariBug':'Abrir asistente MariBug'} aria-controls="qa-assistant-panel" aria-expanded={open} onClick={()=>{returnFocus.current=null;if(open)close();else setOpen(true)}}><Ladybug/></button>
 </div>;
}
