'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useRef,useState} from 'react';
import {useAuth,AuthApiError} from '@/features/auth/auth-provider';
import './qa-assistant.css';
import {studySuggestions} from './study-suggestions';

type Message={role:'user'|'assistant';content:string};
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
 const {user,loading}=useAuth();
 // Clear conversation and cancel requests when the identity changes.
 return <AssistantChat key={user?.id||'guest'} signedIn={!!user} authLoading={loading}/>;
}
function AssistantChat({signedIn,authLoading}:{signedIn:boolean;authLoading:boolean}){
 const path=usePathname();
 const [open,setOpen]=useState(false),[messages,setMessages]=useState<Message[]>([]),[draft,setDraft]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const trigger=useRef<HTMLButtonElement>(null),input=useRef<HTMLTextAreaElement>(null),bottom=useRef<HTMLDivElement>(null),pending=useRef<AbortController|null>(null);
 const close=()=>{setOpen(false);trigger.current?.focus()};
 useEffect(()=>()=>pending.current?.abort(),[]);
 useEffect(()=>{if(open&&signedIn)input.current?.focus()},[open,signedIn]);
 useEffect(()=>{if(open)bottom.current?.scrollIntoView({block:'nearest'})},[messages,busy,open,error]);
 async function send(text=draft){
  if(!text.trim()||busy||!signedIn)return;
  // Only complete pairs are retained. The next request always ends with a user turn.
  const history=[...messages.slice(-4).map(m=>({...m,content:m.content.slice(0,3000)})),{role:'user' as const,content:text.trim()}];
  setMessages(history);setDraft('');setError('');setBusy(true);
  const controller=new AbortController();pending.current=controller;
  const timer=setTimeout(()=>controller.abort(),35000);
  try{
   const safePath=/^\/(?:modules(?:\/[a-zA-Z0-9-]+)?|study\/\d+|scrum|project|resources|account|admin)?$/.test(path)?path:undefined;
   const response=await fetch('/api/v1/assistant/chat',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({messages:history,page:safePath})});
   const data=await response.json() as {data?:{answer:string;truncated?:boolean};message?:string;error?:{message?:string}};
   if(!response.ok)throw new AuthApiError(response.status,response.status===401?'Tu sesión venció. Vuelve a iniciar sesión.':data.message||data.error?.message||'No fue posible consultar a Lía QA.');
   if(!data.data?.answer)throw new Error('La IA no devolvió una respuesta. Inténtalo de nuevo.');
   setMessages([...history,{role:'assistant',content:data.data.answer+(data.data.truncated?'\n\nRespuesta recortada. Puedes pedirme que continúe.':'')}]);
  }catch(e){
   if(!controller.signal.aborted||pending.current===controller){
    setMessages(history.slice(0,-1));setDraft(text);
    setError(controller.signal.aborted?'La consulta tardó demasiado. Puedes volver a enviarla.':e instanceof Error?e.message:'No se pudo conectar con la IA.');
   }
  }finally{clearTimeout(timer);if(pending.current===controller){pending.current=null;setBusy(false)}}
 }
 return <div className="qa-helper">
  {open&&<section className="qa-chat" role="dialog" aria-label="Lía QA, asistente de QA Engineer" onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();close()}}}>
   <header className="qa-chat-header"><span className="qa-chat-avatar"><Ladybug/></span><div><h2>Lía QA <span>IA</span></h2><p>Tu mentora de QA Engineer</p></div><button type="button" className="qa-icon-button" onClick={close} aria-label="Cerrar asistente">×</button></header>
   <div className="qa-chat-body">
    <div className="qa-intro"><span className="qa-intro-label">ENCUENTRA EL SIGUIENTE PASO</span><h3>Pequeña aliada.<br/>Grandes pruebas.</h3><p>Diseñemos mejores pruebas, investiguemos bugs y automaticemos con criterio.</p></div>
    {!signedIn?<div className="qa-signin"><p>{authLoading?'Comprobando tu sesión…':'Inicia sesión para conversar conmigo y practicar QA.'}</p>{!authLoading&&<Link className="button button-primary" href="/login" onClick={close}>Iniciar sesión ↗</Link>}</div>:<>
     {messages.length===0&&<div className="qa-suggestions">{suggestions.map(([label,prompt])=><button key={label} onClick={()=>void send(prompt)} disabled={busy}>{label}<span aria-hidden="true">↗</span></button>)}</div>}
     <details className="qa-study-topics"><summary>Explorar módulos y temas de estudio</summary><div>{studySuggestions.map(group=><details key={group.title} className="qa-study-group"><summary>{group.title}</summary><div className="qa-suggestions">{group.questions.map(([label,prompt])=><button key={label} type="button" disabled={busy} onClick={()=>void send(prompt)}>{label}<span aria-hidden="true">↗</span></button>)}</div></details>)}</div></details>
     <div className="qa-transcript" role="log" aria-label="Conversación con Lía QA" aria-live="polite" aria-relevant="additions">{messages.map((message,i)=><article className={`qa-message qa-message-${message.role}`} key={i}><b>{message.role==='user'?'Tú':'Lía QA'}</b><div><Answer text={message.content}/></div></article>)}</div>
     {busy&&<p className="qa-thinking" role="status"><span/> Preparando tu respuesta…</p>}
     {error&&<p className="qa-chat-error" role="alert">{error}</p>}
     <div ref={bottom}/>
    </>}
   </div>
   {signedIn&&<form className="qa-composer" onSubmit={e=>{e.preventDefault();void send()}}>
    <label className="qa-sr-only" htmlFor="qa-question">Tu pregunta sobre QA</label><div><textarea id="qa-question" ref={input} placeholder="¿Qué vamos a probar hoy?" value={draft} maxLength={2000} rows={2} disabled={busy} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();void send()}}}/><button type="submit" disabled={busy||!draft.trim()} aria-label="Enviar pregunta">↑</button></div>
    <div className="qa-composer-meta"><span>IA · Revisa sus respuestas. No compartas datos sensibles.</span><button type="button" disabled={busy||messages.length===0} onClick={()=>{setMessages([]);setError('');setDraft('');input.current?.focus()}}>Limpiar</button></div>
    <small>Tu consulta se envía a Google Gemini.</small>
   </form>}
  </section>}
  <button ref={trigger} className={'qa-launcher'+(open?' is-open':'')} type="button" aria-label={open?'Cerrar asistente Lía QA':'Abrir asistente Lía QA'} aria-expanded={open} onClick={()=>open?close():setOpen(true)}><Ladybug/><span className="qa-launcher-name">Lía QA</span><span className="qa-launcher-dot"/></button>
 </div>;
}
