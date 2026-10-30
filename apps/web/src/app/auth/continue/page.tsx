'use client';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {authRequest,authRedirect,useAuth} from '@/features/auth/auth-provider';
import type {LoginOutcomeDTO} from '@qapath/contracts';
import {MfaEnrollmentCard} from '@/components/security/mfa-enrollment-card';
type Stage=LoginOutcomeDTO['stage'];
type Enroll={secret:string;uri:string};
type Activation=LoginOutcomeDTO&{recoveryCodes:string[]};
export default function ContinueLoginPage(){
 const router=useRouter(),{complete}=useAuth();const [stage,setStage]=useState<Stage|null>(null);
 const [password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[code,setCode]=useState('');
 const [enroll,setEnroll]=useState<Enroll|null>(null),[codes,setCodes]=useState<string[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [resetSent,setResetSent]=useState(''),[resetAsk,setResetAsk]=useState(false);
 useEffect(()=>{void authRequest<{stage:Stage}>('/auth/challenge').then(v=>setStage(v.stage)).catch(()=>setError('El desafío expiró. Inicia sesión nuevamente.'))},[]);
 async function action(fn:()=>Promise<void>){setBusy(true);setError('');try{await fn()}catch(e){setError(e instanceof Error?e.message:'Error de seguridad')}finally{setBusy(false)}}
 const apply=(outcome:LoginOutcomeDTO)=>{complete(outcome);if(outcome.stage==='AUTHENTICATED')router.replace(authRedirect(outcome,new URLSearchParams(location.search).get('next')));else setStage(outcome.stage)};
 const changePassword=()=>void action(async()=>{if(password!==confirm)throw new Error('Las contraseñas no coinciden.');const r=await authRequest<LoginOutcomeDTO>('/auth/change-initial-password','POST',{newPassword:password});setPassword('');setConfirm('');apply(r)});
 const startMfa=()=>void action(async()=>setEnroll(await authRequest<Enroll>('/auth/mfa/setup','POST',{})));
 const activateMfa=()=>void action(async()=>{const r=await authRequest<Activation>('/auth/mfa/activate','POST',{code});setCodes(r.recoveryCodes);setEnroll(null);complete(r);setStage('AUTHENTICATED')});
 const requestReset=()=>void action(async()=>{const r=await authRequest<{message:string}>('/auth/mfa/reset/request','POST',{});setResetSent(r.message);setResetAsk(false)});
 const verifyMfa=()=>void action(async()=>apply(await authRequest<LoginOutcomeDTO>('/auth/mfa/verify','POST',{code})));
 return <div className="auth-page"><section className="auth-card"><p className="eyebrow">IDENTIDAD · SEGURIDAD</p>
 <h1>{stage==='CHANGE_PASSWORD'?'Cambia tu contraseña inicial':stage==='MFA_SETUP'?'Configura autenticación MFA':stage==='MFA_VERIFY'?'Verifica el segundo factor':stage==='AUTHENTICATED'?'Acceso confirmado':'Validando desafío…'}</h1>
 {error&&<p role="alert" className="feedback bad">{error}</p>}
 {stage==='CHANGE_PASSWORD'&&<form onSubmit={e=>{e.preventDefault();changePassword()}}><p>Por seguridad, la contraseña asignada inicialmente solo puede utilizarse una vez. Define una nueva.</p><label>Nueva contraseña<input type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={password} onChange={e=>setPassword(e.target.value)}/></label><label>Confirmar contraseña<input type="password" autoComplete="new-password" minLength={12} required value={confirm} onChange={e=>setConfirm(e.target.value)}/></label><button className="button button-primary" disabled={busy}>Cambiar contraseña</button></form>}
 {stage==='MFA_SETUP'&&!enroll&&<><p>Los administradores deben utilizar MFA. Vincula una app compatible con TOTP (Google Authenticator, Microsoft Authenticator u otra).</p><button className="button button-primary" disabled={busy} onClick={startMfa}>Generar clave MFA</button></>}
 {stage==='MFA_SETUP'&&enroll&&<form onSubmit={e=>{e.preventDefault();activateMfa()}}><MfaEnrollmentCard uri={enroll.uri} secret={enroll.secret}/><label>Código generado por tu app<input inputMode="numeric" pattern="[0-9]{6}" autoComplete="one-time-code" required value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,''))} maxLength={6}/></label><button className="button button-primary" disabled={busy}>Activar MFA</button></form>}
 {stage==='MFA_VERIFY'&&<form onSubmit={e=>{e.preventDefault();verifyMfa()}}><p>Introduce el código de 6 dígitos de tu app o un código de recuperación.</p><label>Código<input autoComplete="one-time-code" required value={code} onChange={e=>setCode(e.target.value)} maxLength={40}/></label><button className="button button-primary" disabled={busy}>Verificar</button></form>}
 {stage==='MFA_VERIFY'&&<div className="mfa-reset-help">{resetSent?<p role="status" className="feedback good">{resetSent} Abre el enlace en este dispositivo o en otro.</p>:!resetAsk?<button type="button" className="text-link" onClick={()=>setResetAsk(true)}>¿Perdiste tu app de autenticación? Restablecer MFA</button>:<div className="feedback" role="group" aria-label="Restablecer MFA"><p><strong>Restablecer MFA por correo.</strong> Si tienes un código de recuperación, úsalo arriba. Si no, te enviaremos un enlace de un solo uso al correo de la cuenta. Al abrirlo se eliminan tu clave y tus códigos de recuperación, se cierran tus sesiones y en el próximo inicio de sesión vincularás tu app con un QR nuevo.</p><div className="auth-actions"><button type="button" className="button button-primary" disabled={busy} onClick={requestReset}>Enviar enlace</button><button type="button" className="button button-outline" onClick={()=>setResetAsk(false)}>Cancelar</button></div><p className="hint">¿No recibes el correo? Pide a un administrador que restablezca tu MFA desde Administración.</p></div>}</div>}
 {codes.length>0&&<div className="feedback good" role="status"><h2>Guarda tus códigos de recuperación</h2><p>Se muestran una única vez. Cada código puede utilizarse una sola vez. Guárdalos fuera del navegador.</p><pre style={{whiteSpace:'pre-wrap'}}>{codes.join('\n')}</pre><button className="button button-outline" onClick={()=>{void navigator.clipboard.writeText(codes.join('\n'))}}>Copiar códigos</button><p><Link className="button button-primary" href="/account">Ir a mi cuenta</Link></p></div>}
 {stage==='AUTHENTICATED'&&codes.length===0&&<p role="status">Acceso completado. Cargando tu cuenta…</p>}
 <p><Link className="text-link" href="/login">Volver al inicio de sesión</Link></p></section></div>;
}
