'use client';
import {useState} from 'react';
import type {FormEvent} from 'react';

/** Restablecimiento administrativo del MFA de otra cuenta (estudiante o ADMIN). Queda auditado. */
export function AdminMfaReset(){
 const [email,setEmail]=useState(''),[confirming,setConfirming]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 async function submit(event:FormEvent){
  event.preventDefault();setError('');setMessage('');
  if(!confirming){setConfirming(true);return;}
  setBusy(true);
  try{
   const response=await fetch('/api/v1/admin/mfa-reset',{method:'POST',cache:'no-store',credentials:'same-origin',headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify({email:email.trim()})});
   const payload=await response.json().catch(()=>null) as {data?:{email:string;role:string};message?:string|string[]}|null;
   if(!response.ok)throw new Error(Array.isArray(payload?.message)?payload.message.join('; '):payload?.message||`Error HTTP ${response.status}`);
   setMessage(`MFA restablecido para ${payload?.data?.email}. Sus sesiones se cerraron; en su próximo inicio de sesión ${payload?.data?.role==='ADMIN'?'vinculará un QR nuevo':'podrá activar MFA de nuevo desde Mi cuenta'}.`);
   setEmail('');setConfirming(false);
  }catch(e){setError(e instanceof Error?e.message:'No fue posible restablecer el MFA.');setConfirming(false)}
  finally{setBusy(false)}
 }
 return <section className="admin-panel" aria-labelledby="admin-mfa-reset-title">
  <h2 id="admin-mfa-reset-title">Restablecer autenticación en dos pasos (MFA)</h2>
  <p className="hint">Para una persona que perdió su app de autenticación. Se eliminan su clave MFA y sus códigos de recuperación y se cierran sus sesiones. No se modifica su progreso. La acción queda registrada en la auditoría con tu cuenta.</p>
  {error&&<p className="feedback bad" role="alert">{error}</p>}{message&&<p className="feedback good" role="status">{message}</p>}
  <form onSubmit={e=>void submit(e)} className="admin-mfa-reset-form">
   <label>Correo de la cuenta<input type="email" required maxLength={254} value={email} onChange={e=>{setEmail(e.target.value);setConfirming(false)}} autoComplete="off"/></label>
   {confirming&&<p role="status" className="feedback">¿Confirmas que quieres restablecer el MFA de <strong>{email.trim()}</strong>? Pulsa de nuevo para confirmar.</p>}
   <button className={`button ${confirming?'button-primary':'button-outline'}`} disabled={busy||!email.trim()}>{busy?'Restableciendo…':confirming?'Confirmar restablecimiento':'Restablecer MFA'}</button>
  </form>
 </section>;
}
