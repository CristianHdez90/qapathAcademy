'use client';
import {useEffect,useState} from 'react';
import type {FormEvent} from 'react';
import Link from 'next/link';
import {authRequest} from '@/features/auth/auth-provider';
/**
 * Destino del enlace «Restablecer contraseña». Acepta el enlace propio (#token=…) y el de Firebase (?mode=resetPassword&oobCode=…).
 * El código se lee una vez y se quita de la barra de direcciones.
 */
export default function ResetPasswordPage(){
 const [token,setToken]=useState<string|null>(null),[password,setPassword]=useState(''),[confirm,setConfirm]=useState('');
 const [done,setDone]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{
  const query=new URLSearchParams(window.location.search),hash=new URLSearchParams(window.location.hash.replace(/^#/,''));
  const value=hash.get('token')||query.get('oobCode')||'';
  window.history.replaceState(null,'',window.location.pathname);
  // El código solo existe en el navegador: se lee una vez al montar.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setToken(value);
 },[]);
 const mismatch=confirm.length>0&&confirm!==password,short=password.length>0&&password.length<12;
 async function submit(e:FormEvent){e.preventDefault();if(!token)return;
  if(password.length<12||password.length>128){setError('La contraseña debe tener entre 12 y 128 caracteres.');return}
  if(password!==confirm){setError('Las contraseñas no coinciden.');return}
  setBusy(true);setError('');
  try{const r=await authRequest<{reset:boolean;message:string}>('/auth/password/reset','POST',{token,newPassword:password});setDone(r.message);setPassword('');setConfirm('')}
  catch(err){setError(err instanceof Error?err.message:'No fue posible restablecer la contraseña.')}finally{setBusy(false)}}
 return <div className="auth-page"><section className="auth-card" aria-labelledby="reset-title"><p className="eyebrow">QAPATH ACADEMY · IDENTIDAD</p><h1 id="reset-title">Elige una contraseña nueva</h1>
  {error&&<p role="alert" className="feedback bad">{error}</p>}
  {done?<div role="status" className="feedback good"><p><strong>{done}</strong></p><p>Tu cuenta quedó desbloqueada y tus sesiones anteriores se cerraron.</p><p><Link className="button button-primary" href="/login">Iniciar sesión</Link></p></div>
  :token===null?<p role="status">Validando enlace…</p>
  :!token?<div className="feedback bad" role="alert"><p>El enlace no es válido o está incompleto.</p><p><Link className="text-link" href="/auth/forgot-password">Pedir un enlace nuevo</Link></p></div>
  :<form onSubmit={e=>void submit(e)} noValidate>
   <label>Contraseña nueva<input type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={password} aria-invalid={short} aria-describedby="reset-hint" onChange={e=>setPassword(e.target.value)} placeholder="Mínimo 12 caracteres"/></label>
   <small id="reset-hint" className="hint">Entre 12 y 128 caracteres. Combina letras, números y símbolos.</small>
   <label>Repite la contraseña<input type="password" autoComplete="new-password" required maxLength={128} value={confirm} aria-invalid={mismatch} onChange={e=>setConfirm(e.target.value)}/></label>
   {mismatch&&<small className="field-error" role="alert">Las contraseñas no coinciden.</small>}
   <button className="button button-primary" disabled={busy}>{busy?'Guardando…':'Guardar contraseña'} ↗</button></form>}
  <p><Link className="text-link" href="/login">Volver al inicio de sesión</Link></p></section></div>;
}
