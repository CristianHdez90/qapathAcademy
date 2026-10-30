'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {authRequest} from '@/features/auth/auth-provider';

/** Destino del enlace «Restablecer MFA». El token viaja en el fragmento (#token) y se confirma con un clic explícito. */
export default function MfaResetPage(){
 const [token,setToken]=useState<string|null>(null),[done,setDone]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{const value=new URLSearchParams(window.location.hash.replace(/^#/,'')).get('token');window.history.replaceState(null,'',window.location.pathname);
  // El fragmento solo existe en el navegador: se lee una vez al montar y se elimina de la barra de direcciones.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setToken(value||'')},[]);
 async function confirm(){if(!token)return;setBusy(true);setError('');try{await authRequest<{reset:boolean}>('/auth/mfa/reset/confirm','POST',{token});setDone(true)}catch(e){setError(e instanceof Error?e.message:'No fue posible restablecer el MFA.')}finally{setBusy(false)}}
 return <div className="auth-page"><section className="auth-card"><p className="eyebrow">IDENTIDAD · SEGURIDAD</p><h1>Restablecer autenticación en dos pasos</h1>
  {error&&<p role="alert" className="feedback bad">{error}</p>}
  {done?<div role="status" className="feedback good"><p><strong>MFA restablecido.</strong> Tus sesiones se cerraron. Inicia sesión con tu correo y contraseña: si eres administrador verás «Generar clave MFA» para vincular tu app con un QR nuevo; si eres estudiante puedes activarlo de nuevo desde Mi cuenta.</p><p><Link className="button button-primary" href="/login">Iniciar sesión</Link></p></div>
  :token===null?<p role="status">Validando enlace…</p>
  :!token?<p className="feedback bad" role="alert">El enlace no contiene un token. Vuelve a solicitarlo desde «¿Perdiste tu app?» al iniciar sesión.</p>
  :<><p>Al confirmar se eliminarán tu clave MFA y tus códigos de recuperación y se cerrarán todas tus sesiones. Tu progreso, notas y evidencias no cambian.</p><button className="button button-primary" disabled={busy} onClick={()=>void confirm()}>{busy?'Restableciendo…':'Confirmar restablecimiento'}</button></>}
  <p><Link className="text-link" href="/login">Volver al inicio de sesión</Link></p></section></div>;
}
