'use client';
import {useEffect,useState} from 'react';
import type {FormEvent} from 'react';
import Link from 'next/link';
import {authRequest} from '@/features/auth/auth-provider';
export default function VerifyEmailPage(){
 const [email,setEmail]=useState(''),[message,setMessage]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [password,setPassword]=useState('');const [firebaseAuth,setFirebaseAuth]=useState(false);
 useEffect(()=>{
  void authRequest<{provider:string}>('/auth/config').then(config=>setFirebaseAuth(config.provider==='firebase')).catch(()=>setError('No fue posible consultar el servicio de autenticación.'));
  const query=new URLSearchParams(window.location.search);
  const hash=new URLSearchParams(window.location.hash.replace(/^#/,''));const token=query.get('mode')==='verifyEmail'?query.get('oobCode'):hash.get('token');
  if(!token)return;window.history.replaceState(null,'',window.location.pathname);
  void authRequest<{verified:boolean}>('/auth/verify-email','POST',{token}).then(()=>setMessage('Correo verificado. Ya puedes iniciar sesión.')).catch(e=>setError(e instanceof Error?e.message:'No fue posible verificar el correo.'));
 },[]);
 async function resend(e:FormEvent){e.preventDefault();setBusy(true);setError('');try{const r=await authRequest<{message:string}>('/auth/resend-verification','POST',{email,...(firebaseAuth?{password}:{})});setMessage(r.message);setPassword('')}catch(e){setError(e instanceof Error?e.message:'No fue posible enviar el correo.')}finally{setBusy(false)}}
 return <div className="auth-page"><section className="auth-card"><p className="eyebrow">SEGURIDAD · CORREO</p><h1>Verificación de correo</h1><p>Revisa tu buzón y abre el enlace de verificación. Si ya verificaste el correo, vuelve a iniciar sesión para actualizar tu cuenta.</p>
 {error&&<p className="feedback bad" role="alert">{error}</p>}{message&&<p className="feedback good" role="status">{message}</p>}
 <form onSubmit={e=>void resend(e)}><label>Correo de la cuenta<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="correo@ejemplo.com"/></label>{firebaseAuth&&<label>Contraseña de la cuenta<input type="password" autoComplete="current-password" required maxLength={128} value={password} onChange={e=>setPassword(e.target.value)}/></label>}<button className="button button-outline" disabled={busy}>Reenviar verificación</button></form>
 <p><Link href="/login" className="text-link">Ir a iniciar sesión →</Link></p></section></div>;
}
