import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {SecureAuthenticationService,SecurityFlowError,AccountLocked}=require('../libs/identity/dist/index.js');
/** «¿Olvidaste tu contraseña?»: respuesta genérica, 1 solicitud/minuto, enlace de un solo uso, desbloqueo y cierre de sesiones. */
function harness({external=false}={}){
 let sequence=0;const audit=[];const sessions=new Map(),resets=new Map(),mails=[],firebase={sent:[],password:'vieja-clave-123'};
 const user={id:'u1',email:'ana@example.com',passwordHash:'hash:vieja-clave-123',role:'STUDENT',failedAttempts:5,lockedUntil:new Date(Date.now()+15*60000),isActive:true,emailVerifiedAt:new Date(),mustChangePassword:true,mfaEnabled:false,firebaseUid:external?'fb1':null};
 const ports={
  users:{findByEmail:async e=>e===user.email?user:null,findById:async id=>id===user.id?user:null,recordFailure:async()=>{},resetFailures:async()=>{},syncExternalVerification:async()=>{}},
  passwords:{hash:async p=>`hash:${p}`,verify:async(p,h)=>h===`hash:${p}`},
  sessions:{create:async(id,hash)=>{sessions.set(hash,user)},findUserByTokenHash:async h=>sessions.get(h)||null,revoke:async h=>{sessions.delete(h)}},
  tokens:{issue:()=>`token-${++sequence}-${'a'.repeat(40)}`,hash:x=>x},
  security:{
   createChallenge:async()=>{},findChallenge:async()=>null,audit:async()=>{},
   createPasswordReset:async(userId,hash,expiresAt)=>{if([...resets.values()].some(r=>r.userId===userId&&Date.now()-r.at<60000))return false;for(const r of resets.values())r.used=true;resets.set(hash,{userId,expiresAt,used:false,at:Date.now()});return true},
   consumePasswordReset:async hash=>{const r=resets.get(hash);if(!r||r.used||r.expiresAt<=new Date())return null;r.used=true;return r.userId},
   unlockAccount:async(id,actor)=>{user.failedAttempts=0;user.lockedUntil=null;audit.push(`ACCOUNT_UNLOCKED_BY_ADMIN:${actor}`)},
   auditAdmin:async(id,actor,action)=>{audit.push(`${action}:${actor}`)},
   completePasswordReset:async(id,hash)=>{if(hash)user.passwordHash=hash;user.mustChangePassword=false;user.failedAttempts=0;user.lockedUntil=null;sessions.clear()},
  },
  totp:{},
  mailer:{sendVerification:async()=>{},sendPasswordReset:async(email,token)=>{mails.push({email,token})}},
  ...(external?{external:{
   validSession:async()=>true,
   authenticate:async(email,password)=>{if(password!==firebase.password)throw new (require('../libs/identity/dist/index.js').AuthError)();return {uid:'fb1',email,emailVerified:true}},
   sendPasswordReset:async email=>{firebase.sent.push(email)},
   confirmPasswordReset:async(code,newPassword)=>{if(code!=='oob-code-valido-123456')throw new (require('../libs/identity/dist/index.js').AuthError)();firebase.password=newPassword;return {email:user.email}},
  }}:{}),
 };
 return {auth:new SecureAuthenticationService(ports),user,mails,sessions,firebase,audit};
}
test('local: enlace por correo, respuesta genérica, una vez por minuto; al usarlo desbloquea y cambia la contraseña',async()=>{
 const h=harness();
 await assert.rejects(h.auth.signIn(h.user.email,'vieja-clave-123'),AccountLocked,'la cuenta empieza bloqueada');
 const unknown=await h.auth.requestPasswordReset('nadie@example.com');
 const known=await h.auth.requestPasswordReset('ANA@example.com');
 assert.equal(unknown.message,known.message,'no revela si el correo existe');
 assert.equal(h.mails.length,1);assert.equal(h.mails[0].email,'ana@example.com');
 await h.auth.requestPasswordReset(h.user.email);assert.equal(h.mails.length,1,'una solicitud por minuto');
 await assert.rejects(h.auth.confirmPasswordReset(h.mails[0].token,'corta'),SecurityFlowError);
 await assert.rejects(h.auth.confirmPasswordReset('x'.repeat(48),'nueva-clave-segura-1'),SecurityFlowError);
 const result=await h.auth.confirmPasswordReset(h.mails[0].token,'nueva-clave-segura-1');
 assert.equal(result.reset,true);
 assert.equal(h.user.lockedUntil,null);assert.equal(h.user.failedAttempts,0);assert.equal(h.user.mustChangePassword,false);
 await assert.rejects(h.auth.confirmPasswordReset(h.mails[0].token,'otra-clave-segura-2'),SecurityFlowError,'no se reutiliza');
 assert.equal((await h.auth.signIn(h.user.email,'nueva-clave-segura-1')).stage,'AUTHENTICATED');
 await assert.rejects(h.auth.signIn(h.user.email,'vieja-clave-123'));
});
test('Firebase: el proveedor envía el correo y aplica la contraseña; la cuenta local se desbloquea',async()=>{
 const h=harness({external:true});
 await h.auth.requestPasswordReset(h.user.email);
 assert.deepEqual(h.firebase.sent,['ana@example.com']);assert.equal(h.mails.length,0,'con Firebase no se usa el correo propio');
 await assert.rejects(h.auth.confirmPasswordReset('oob-code-invalido-0000','nueva-clave-segura-1'),e=>e instanceof SecurityFlowError&&/inválido/.test(e.message));
 await h.auth.confirmPasswordReset('oob-code-valido-123456','nueva-clave-segura-1');
 assert.equal(h.firebase.password,'nueva-clave-segura-1');
 assert.equal(h.user.lockedUntil,null);assert.equal(h.user.passwordHash,'hash:vieja-clave-123','el hash local no se toca con Firebase');
});
test('administración: desbloquear y enviar enlace de contraseña quedan auditados con el administrador',async()=>{
 const h=harness();
 assert.deepEqual(await h.auth.unlockByAdmin('u1','admin-1'),{unlocked:true,email:'ana@example.com'});
 assert.equal(h.user.lockedUntil,null);assert.ok(h.audit.includes('ACCOUNT_UNLOCKED_BY_ADMIN:admin-1'));
 const sent=await h.auth.sendPasswordResetByAdmin('u1','admin-1');
 assert.equal(sent.sent,true);assert.equal(h.mails.length,1);assert.ok(h.audit.includes('PASSWORD_RESET_SENT_BY_ADMIN:admin-1'));
 await assert.rejects(h.auth.unlockByAdmin('nadie','admin-1'),SecurityFlowError);
 h.user.isActive=false;await assert.rejects(h.auth.sendPasswordResetByAdmin('u1','admin-1'),/inactiva/);
 assert.equal(h.auth.mfaEmailResetEnabled,false,'sin sendMfaReset en el correo, el restablecimiento MFA por correo no se ofrece');
 assert.equal(harness({external:true}).auth.mfaEmailResetEnabled,false,'con Firebase tampoco');
});
