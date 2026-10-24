'use client';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useState} from 'react';
import type {FormEvent} from 'react';
import {useAuth,authRedirect} from '@/features/auth/auth-provider';
export function AuthForm({mode}:{mode:'login'|'register'}){
 const {signIn,signUp}=useAuth();const router=useRouter();
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState('');
 const [error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);const register=mode==='register';
 async function submit(e:FormEvent){e.preventDefault();setError('');setMessage('');
  if(register&&password!==confirm){setError('Las contraseñas no coinciden.');return;}
  setBusy(true);try{
   if(register){const result=await signUp(email,password);setMessage(result.message+' Revisa tu correo antes de iniciar sesión.');setPassword('');setConfirm('');}
   else{const outcome=await signIn(email,password);router.replace(authRedirect(outcome));}
  }catch(e){setError(e instanceof Error?e.message:'No fue posible completar la solicitud.')}finally{setBusy(false)}
 }
 return <div className="auth-page"><section className="auth-card"><p className="eyebrow">QAPATH ACADEMY · IDENTIDAD</p>
 <h1>{register?'Crear cuenta de estudiante':'Iniciar sesión'}</h1><p>{register?'Verifica tu correo para activar la cuenta y sincronizar tu progreso.':'El acceso puede solicitar verificación de correo, cambio de contraseña inicial o MFA.'}</p>
 <form onSubmit={e=>{void submit(e)}}><label>Correo electrónico<input autoComplete="email" type="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="estudiante@ejemplo.com"/></label>
 <label>Contraseña<input autoComplete={register?'new-password':'current-password'} type="password" required minLength={register?12:1} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} placeholder={register?'Mínimo 12 caracteres':'Tu contraseña'}/></label>
 {register&&<label>Confirmar contraseña<input type="password" autoComplete="new-password" required minLength={12} value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>}
 {error&&<p role="alert" className="feedback bad">{error}</p>}{message&&<p role="status" className="feedback good">{message}</p>}
 <button className="button button-primary" disabled={busy}>{busy?'Procesando…':register?'Registrarme':'Continuar'} ↗</button></form>
 <p>{register?'¿Ya tienes cuenta?':'¿Aún no tienes cuenta?'} <Link className="text-link" href={register?'/login':'/register'}>{register?'Iniciar sesión':'Registrarme'}</Link></p>
 {!register&&<p><Link className="text-link" href="/verify-email">Reenviar correo de verificación</Link></p>}
 <p className="hint">Las sesiones y los desafíos MFA usan cookies HttpOnly. No almacenamos claves en el navegador.</p></section></div>;
}
