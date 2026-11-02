'use client';
import {useState} from 'react';
import type {FormEvent} from 'react';
import Link from 'next/link';
import {authRequest} from '@/features/auth/auth-provider';
/** «¿Olvidaste tu contraseña?»: pide el enlace de restablecimiento. La respuesta no revela si el correo existe. */
export default function ForgotPasswordPage(){
 const [email,setEmail]=useState(''),[message,setMessage]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError('');setMessage('');
  try{const r=await authRequest<{message:string}>('/auth/password/forgot','POST',{email:email.trim()});setMessage(r.message)}
  catch(err){setError(err instanceof Error?err.message:'No fue posible enviar el enlace.')}finally{setBusy(false)}}
 return <div className="auth-page"><section className="auth-card" aria-labelledby="forgot-title"><p className="eyebrow">QAPATH ACADEMY · IDENTIDAD</p><h1 id="forgot-title">¿Olvidaste tu contraseña?</h1>
  <p>Escribe el correo de tu cuenta y te enviaremos un enlace para elegir una contraseña nueva. Al cambiarla, la cuenta se desbloquea y se cierran tus sesiones abiertas.</p>
  {error&&<p role="alert" className="feedback bad">{error}</p>}
  {message?<div role="status" className="feedback good"><p>{message}</p><p className="hint">¿No llega? Espera un minuto y vuelve a pedirlo.</p></div>
  :<form onSubmit={e=>void submit(e)}><label>Correo electrónico<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="correo@ejemplo.com"/></label>
   <button className="button button-primary" disabled={busy}>{busy?'Enviando…':'Enviar enlace'} ↗</button></form>}
  <p><Link className="text-link" href="/login">Volver al inicio de sesión</Link></p></section></div>;
}
