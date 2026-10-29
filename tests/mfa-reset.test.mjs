import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {SecureAuthenticationService,SecurityFlowError}=require('../libs/identity/dist/index.js');

function harness({role='ADMIN',mailer=true,external=false}={}){
 let sequence=0;const sessions=new Map(),challenges=new Map(),resets=new Map(),mails=[],audit=[];
 const admin={id:'u1',email:'admin@example.com',passwordHash:'hash:password-12345',role,failedAttempts:0,lockedUntil:null,isActive:true,emailVerifiedAt:new Date(),mustChangePassword:false,mfaEnabled:true};
 const other={id:'u2',email:'otro@example.com',passwordHash:'hash:x',role:'ADMIN',failedAttempts:0,lockedUntil:null,isActive:true,emailVerifiedAt:new Date(),mustChangePassword:false,mfaEnabled:true};
 const all=[admin,other];
 const clear=id=>{const u=all.find(x=>x.id===id);u.mfaEnabled=false;for(const [k,s] of sessions)if(s.id===id)sessions.delete(k);for(const [k,c] of challenges)if(c.userId===id)challenges.delete(k);for(const r of resets.values())if(r.userId===id)r.used=true;};
 const ports={
  users:{findByEmail:async e=>all.find(u=>u.email===e)||null,findById:async id=>all.find(u=>u.id===id)||null,recordFailure:async()=>{},resetFailures:async()=>{}},
  passwords:{hash:async p=>`hash:${p}`,verify:async(p,h)=>h===`hash:${p}`},
  sessions:{create:async(id,hash)=>{sessions.set(hash,all.find(u=>u.id===id))},findUserByTokenHash:async h=>sessions.get(h)||null,revoke:async h=>{sessions.delete(h)}},
  tokens:{issue:()=>`token-${++sequence}-${'a'.repeat(40)}`,hash:x=>x},
  security:{
   createChallenge:async(userId,hash,expiresAt)=>{challenges.set(hash,{id:hash,userId,expiresAt,attempts:0})},
   findChallenge:async h=>challenges.get(h)||null,recordChallengeFailure:async()=>{},consumeChallenge:async id=>challenges.delete(id),
   getMfa:async()=>({enabled:true,secretCiphertext:'s',pendingCiphertext:null,pendingUntil:null,lastUsedStep:-1}),
   claimMfaStep:async()=>false,claimRecoveryCode:async()=>false,audit:async(id,a)=>{audit.push(a)},
   createMfaReset:async(userId,hash,expiresAt)=>{if([...resets.values()].some(r=>r.userId===userId&&!r.used&&Date.now()-r.at<60000))return false;resets.set(hash,{userId,expiresAt,used:false,at:Date.now()});return true},
   consumeMfaReset:async hash=>{const r=resets.get(hash);if(!r||r.used||r.expiresAt<=new Date())return null;r.used=true;clear(r.userId);audit.push('MFA_RESET_BY_EMAIL');return r.userId},
   resetMfa:async(id,actor,reason)=>{clear(id);audit.push(`MFA_RESET_BY_${reason}:${actor}`)},
  },
  totp:{createSecret:()=>'secret',encrypt:x=>x,decrypt:x=>x,provisioningUri:()=>'otpauth://x',matchingStep:()=>null,newRecoveryCodes:()=>[],hashRecoveryCode:x=>x},
  mailer:mailer?{sendVerification:async()=>{},sendMfaReset:async(email,token)=>{mails.push({email,token})}}:{sendVerification:async()=>{}},
  ...(external?{external:{validSession:async()=>true}}:{}),
 };
 return {auth:new SecureAuthenticationService(ports),admin,other,mails,audit,sessions,resets};
}

test('«¿Perdiste tu app?» envía un enlace de un solo uso al correo y el siguiente inicio vuelve a MFA_SETUP',async()=>{
 const h=harness();
 const login=await h.auth.signIn(h.admin.email,'password-12345');
 assert.equal(login.stage,'MFA_VERIFY');
 const sent=await h.auth.requestMfaReset(login.token);
 assert.match(sent.message,/30 minutos/);
 assert.equal(h.mails.length,1);assert.equal(h.mails[0].email,h.admin.email);
 assert.equal(h.admin.mfaEnabled,true,'pedir el enlace no quita el MFA');
 await h.auth.requestMfaReset(login.token);
 assert.equal(h.mails.length,1,'una solicitud por minuto');
 assert.deepEqual(await h.auth.confirmMfaReset(h.mails[0].token),{reset:true});
 assert.equal(h.admin.mfaEnabled,false);
 assert.ok(h.audit.includes('MFA_RESET_BY_EMAIL'));
 await assert.rejects(h.auth.confirmMfaReset(h.mails[0].token),SecurityFlowError,'no se reutiliza');
 await assert.rejects(h.auth.requestMfaReset(login.token),SecurityFlowError,'el desafío anterior queda anulado');
 assert.equal((await h.auth.signIn(h.admin.email,'password-12345')).stage,'MFA_SETUP');
});

test('el restablecimiento por correo exige un desafío MFA vigente y un token con formato válido',async()=>{
 const h=harness();
 await assert.rejects(h.auth.requestMfaReset(''),SecurityFlowError);
 await assert.rejects(h.auth.requestMfaReset('token-desconocido-'+'b'.repeat(40)),SecurityFlowError);
 await assert.rejects(h.auth.confirmMfaReset('corto'),SecurityFlowError);
 await assert.rejects(h.auth.confirmMfaReset('x'.repeat(48)),SecurityFlowError);
 assert.equal(h.mails.length,0);
 const noMail=harness({mailer:false});const login=await noMail.auth.signIn(noMail.admin.email,'password-12345');
 await assert.rejects(noMail.auth.requestMfaReset(login.token),e=>e instanceof SecurityFlowError&&e.status===503&&/administrador/.test(e.message));
});

test('un ADMIN restablece el MFA de otra cuenta con auditoría, pero no el suyo',async()=>{
 const h=harness();
 const result=await h.auth.resetMfaByAdmin('OTRO@example.com',h.admin.id);
 assert.deepEqual(result,{reset:true,email:'otro@example.com',role:'ADMIN'});
 assert.equal(h.other.mfaEnabled,false);
 assert.ok(h.audit.includes(`MFA_RESET_BY_ADMIN:${h.admin.id}`));
 await assert.rejects(h.auth.resetMfaByAdmin(h.admin.email,h.admin.id),e=>e instanceof SecurityFlowError&&e.status===403);
 await assert.rejects(h.auth.resetMfaByAdmin('nadie@example.com',h.admin.id),SecurityFlowError);
 assert.equal(h.admin.mfaEnabled,true);
});
