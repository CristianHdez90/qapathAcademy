import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {SecureAuthenticationService,AuthError,SecurityFlowError}=require('../libs/identity/dist');

function harness({legacy=false,role='STUDENT'}={}){
 let user=legacy?{id:'pg-original-id',email:'student@example.test',passwordHash:'hash:old-password-123',role,isActive:true,emailVerifiedAt:new Date(),mustChangePassword:false,mfaEnabled:false}:null;
 let externalUser={uid:'firebase-uid',email:'student@example.test',emailVerified:false};
 let password='old-password-123',revoked=false,mails=0,links=0,seq=0;
 const sessions=new Map(),challenges=new Map();
 const d={
  users:{findByEmail:async email=>user?.email===email?user:null,findById:async id=>user?.id===id?user:null,
   create:async input=>(user={id:'new-pg-id',...input,isActive:true,emailVerifiedAt:null,mustChangePassword:false,mfaEnabled:false}),
   linkExternal:async(id,uid)=>{assert.equal(id,user.id);links++;user={...user,firebaseUid:uid,passwordHash:'external:firebase',emailVerifiedAt:null};return user;},
   syncExternalVerification:async(_,verified)=>{user={...user,emailVerifiedAt:verified?new Date():null};return user;},
   recordFailure:async()=>{},resetFailures:async()=>{}},
  passwords:{hash:async value=>`hash:${value}`,verify:async(value,hash)=>hash===`hash:${value}`},
  tokens:{issue:()=>`token-${++seq}-${'a'.repeat(40)}`,hash:value=>value},
  sessions:{create:async(_,token)=>sessions.set(token,{...user,sessionIssuedAt:new Date()}),findUserByTokenHash:async token=>sessions.get(token)||null,revoke:async token=>sessions.delete(token)},
  security:{createVerification:async()=>true,audit:async()=>{},
   createChallenge:async(userId,token,expiresAt)=>challenges.set(token,{id:token,userId,expiresAt,attempts:0,issuedAt:new Date()}),findChallenge:async token=>challenges.get(token),
   consumeChallenge:async token=>challenges.delete(token),recordChallengeFailure:async()=>{},
   getMfa:async()=>({enabled:true,secretCiphertext:'secret',lastUsedStep:-1}),claimMfaStep:async()=>true,claimRecoveryCode:async()=>false,
   replacePassword:async()=>{user.mustChangePassword=false;sessions.clear();},savePendingMfa:async()=>{}},
  totp:{decrypt:value=>value,matchingStep:(_,code)=>code==='123456'?1:null},
  mailer:{sendVerification:async()=>{throw new Error('No SMTP or Firestore in Firebase Auth mode');}},
  external:{register:async()=>externalUser,authenticate:async(email,value)=>{if(value!==password||email!==externalUser.email)throw new AuthError();return externalUser;},
   migrate:async()=>externalUser,sendVerification:async()=>{mails++;},verifyEmail:async()=>({...externalUser,emailVerified:true}),
   validSession:async()=>!revoked,changePassword:async(_,value)=>{password=value;},changeEmail:async(_,email)=>{externalUser={...externalUser,email,emailVerified:false};}},
 };
 return {auth:new SecureAuthenticationService(d),d,sessions,challenges,get user(){return user;},get mails(){return mails;},get links(){return links;},verify:()=>{externalUser.emailVerified=true;},revoke:()=>{revoked=true;},spoof:()=>{externalUser={...externalUser,uid:'another-uid'};}};
}
test('Firebase registration links a STUDENT without storing a second password or invoking SMTP',async()=>{
 const h=harness();await h.auth.signUp('student@example.test','old-password-123');
 assert.equal(h.user.firebaseUid,'firebase-uid');assert.equal(h.user.role,'STUDENT');assert.equal(h.user.passwordHash,'external:firebase');assert.equal(h.mails,1);
 assert.equal((await h.auth.signIn(h.user.email,'old-password-123')).stage,'VERIFY_EMAIL');assert.equal(h.sessions.size,0);
 h.verify();const login=await h.auth.signIn(h.user.email,'old-password-123');assert.equal(login.stage,'AUTHENTICATED');
 assert.equal((await h.auth.findSession(login.token)).id,'new-pg-id');
 h.revoke();assert.equal(await h.auth.findSession(login.token),null);
});
test('legacy linking requires old password and preserves PostgreSQL ID and role',async()=>{
 const h=harness({legacy:true,role:'ADMIN'});
 await assert.rejects(h.auth.signIn(h.user.email,'incorrect'),AuthError);assert.equal(h.links,0);
 assert.equal((await h.auth.signIn(h.user.email,'old-password-123')).stage,'VERIFY_EMAIL');assert.equal(h.links,1);
 assert.equal(h.user.id,'pg-original-id');assert.equal(h.user.role,'ADMIN');assert.equal(h.user.passwordHash,'external:firebase');
 h.verify();assert.equal((await h.auth.signIn(h.user.email,'old-password-123')).stage,'MFA_SETUP');assert.equal(h.sessions.size,0);
});
test('a different Firebase UID cannot claim an already linked PostgreSQL user',async()=>{
 const h=harness();await h.auth.signUp('student@example.test','old-password-123');h.verify();h.spoof();
 await assert.rejects(h.auth.signIn(h.user.email,'old-password-123'),AuthError);assert.equal(h.sessions.size,0);
 await assert.rejects(h.auth.verifyEmail('a'.repeat(40)),SecurityFlowError);
});
test('local TOTP is still required after Firebase first factor and revoked challenges fail closed',async()=>{
 const h=harness();await h.auth.signUp('student@example.test','old-password-123');h.verify();h.user.mfaEnabled=true;
 const login=await h.auth.signIn(h.user.email,'old-password-123');assert.equal(login.stage,'MFA_VERIFY');assert.equal(h.sessions.size,0);
 await assert.rejects(h.auth.verifyMfa(login.token,'000000'),SecurityFlowError);
 assert.equal((await h.auth.verifyMfa(login.token,'123456')).stage,'AUTHENTICATED');
 const again=await h.auth.signIn(h.user.email,'old-password-123');h.revoke();await assert.rejects(h.auth.verifyMfa(again.token,'123456'),AuthError);
});
test('verification resends require credentials, never accept a bare email as proof of identity',async()=>{
 const h=harness();await h.auth.signUp('student@example.test','old-password-123');
 await assert.rejects(h.auth.resendVerification(h.user.email),SecurityFlowError);
 const wrong=await h.auth.resendVerification(h.user.email,'incorrect');assert.equal(h.mails,1);assert.equal(wrong.verified,undefined);assert.equal(wrong.sent,undefined);
 const sent=await h.auth.resendVerification(h.user.email,'old-password-123');assert.equal(h.mails,2);assert.equal(sent.sent,true);
 // Con la contraseña correcta y el correo ya verificado no se envía nada y se informa el estado real.
 h.verify();const done=await h.auth.resendVerification(h.user.email,'old-password-123');assert.equal(done.verified,true);assert.equal(h.mails,2);assert.match(done.message,/ya está verificado/);
});
