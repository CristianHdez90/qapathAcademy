import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {SecureAuthenticationService,SecurityFlowError,AuthError}=require('../libs/identity/dist/index.js');
function harness(role='ADMIN',temp=true){
 const now=()=>new Date();const tokenSet=new Map(),challengeMap=new Map(),tokens=new Map(),sessions=new Map(),mfa=new Map(),codes=new Map(),mails=[];
 let sequence=0;
 const user={id:'u1',email:'admin@example.com',passwordHash:'hash:temporary-12345',role,failedAttempts:0,lockedUntil:null,isActive:true,emailVerifiedAt:null,mustChangePassword:temp,mfaEnabled:false};
 const users={findByEmail:async e=>e===user.email?user:null,findById:async id=>id===user.id?user:null,create:async()=>{throw Error('unused')},recordFailure:async()=>{},resetFailures:async()=>{}};
 const ports={users,passwords:{hash:async password=>`hash:${password}`,verify:async(pass,hash)=>hash===`hash:${pass}`},sessions:{create:async(_,hash)=>{sessions.set(hash,user)},findUserByTokenHash:async hash=>sessions.get(hash)||null,revoke:async hash=>{sessions.delete(hash)}},tokens:{issue:()=>`token-${++sequence}-${'a'.repeat(50)}`,hash:x=>x},
 security:{
  createVerification:async(id,hash,until)=>{tokenSet.set(hash,{until});return true},
  consumeVerification:async hash=>{if(!tokenSet.has(hash))return false;tokenSet.delete(hash);user.emailVerifiedAt=now();return true},
  createChallenge:async(id,hash,expiresAt)=>{challengeMap.set(hash,{id:hash,userId:id,expiresAt,attempts:0});},
  findChallenge:async hash=>challengeMap.get(hash)||null,
  recordChallengeFailure:async id=>{challengeMap.get(id).attempts++},
  consumeChallenge:async id=>{if(!challengeMap.has(id))return false;challengeMap.delete(id);return true},
  replacePassword:async(id,hash)=>{user.passwordHash=hash;user.mustChangePassword=false;sessions.clear()},
  getMfa:async()=>mfa.get('current')??{enabled:false,pendingCiphertext:null,pendingUntil:null,lastUsedStep:-1,secretCiphertext:null},
  savePendingMfa:async(id,secret,until)=>{mfa.set('current',{enabled:false,pendingCiphertext:secret,pendingUntil:until,secretCiphertext:null,lastUsedStep:-1})},
  activateMfa:async(id,step,hashes)=>{const r=mfa.get('current');if(r.enabled)return false;r.enabled=true;r.secretCiphertext=r.pendingCiphertext;r.pendingCiphertext=null;r.lastUsedStep=step;codes.set('current',new Set(hashes));user.mfaEnabled=true;sessions.clear();return true;},
  claimMfaStep:async(id,step)=>{const r=mfa.get('current');if(step<=r.lastUsedStep)return false;r.lastUsedStep=step;return true;},
  claimRecoveryCode:async(id,hash)=>{const c=codes.get('current');if(!c.has(hash))return false;c.delete(hash);return true},
  audit:async()=>{}
 },
 totp:{createSecret:()=> 'secret32',encrypt:x=>x,decrypt:x=>x,provisioningUri:(email,secret)=>`otpauth://${email}/${secret}`,matchingStep:(_secret,code,last)=>code==='123456'&&last<99?99:null,newRecoveryCodes:()=>['ABCDEF-123456-7890'],hashRecoveryCode:x=>x},
 mailer:{sendVerification:async(_,token)=>{mails.push(token)}}};
 return {auth:new SecureAuthenticationService(ports),user,mails,sessions,challengeMap};
}
test('Admin exige correo, cambio inicial y segundo factor antes de crear una sesión',async()=>{
 const {auth,user,mails,sessions}=harness();
 assert.equal((await auth.signIn(user.email,'temporary-12345')).stage,'VERIFY_EMAIL');
 assert.equal(sessions.size,0);
 await auth.resendVerification(user.email);
 assert.equal(await auth.verifyEmail(mails[0]).then(x=>x.verified),true);
 await assert.rejects(auth.verifyEmail(mails[0]),SecurityFlowError);
 let login=await auth.signIn(user.email,'temporary-12345');
 assert.equal(login.stage,'CHANGE_PASSWORD');assert.equal(sessions.size,0);
 await assert.rejects(auth.changeInitialPassword(login.token,'temporary-12345'),SecurityFlowError);
 login=await auth.changeInitialPassword(login.token,'new-password-12345');
 assert.equal(login.stage,'MFA_SETUP');assert.equal(sessions.size,0);
 const setup=await auth.beginMfa({challengeToken:login.token});
 assert.equal(setup.secret,'secret32');
 await assert.rejects(auth.activateMfa({challengeToken:login.token,code:'999999'}),SecurityFlowError);
 const activated=await auth.activateMfa({challengeToken:login.token,code:'123456'});
 assert.equal(activated.outcome.stage,'AUTHENTICATED');assert.equal(activated.recoveryCodes.length,1);
 assert.equal(sessions.size,1);
 const again=await auth.signIn(user.email,'new-password-12345');
 assert.equal(again.stage,'MFA_VERIFY');assert.equal(sessions.size,1);
 await assert.rejects(auth.verifyMfa(again.token,'123456'),SecurityFlowError); // replay
 assert.equal((await auth.verifyMfa(again.token,'ABCDEF-123456-7890')).stage,'AUTHENTICATED');
 const third=await auth.signIn(user.email,'new-password-12345');
 await assert.rejects(auth.verifyMfa(third.token,'ABCDEF-123456-7890'),SecurityFlowError); // recovery single use
});
test('Alumno verificado puede entrar sin MFA; la activación voluntaria protege accesos futuros',async()=>{
 const {auth,user,mails}=harness('STUDENT',false);
 await auth.resendVerification(user.email);await auth.verifyEmail(mails[0]);
 const signed=await auth.signIn(user.email,'temporary-12345');assert.equal(signed.stage,'AUTHENTICATED');
 await assert.rejects(auth.beginMfa({sessionToken:signed.token,password:'incorrecto'}),AuthError);
 await auth.beginMfa({sessionToken:signed.token,password:'temporary-12345'});
 const activated=await auth.activateMfa({sessionToken:signed.token,code:'123456'});
 assert.equal(activated.outcome.stage,'AUTHENTICATED');
 assert.equal((await auth.signIn(user.email,'temporary-12345')).stage,'MFA_VERIFY');
});
