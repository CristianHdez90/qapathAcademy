import {Injectable} from '@nestjs/common';
import {users,authSessions,adminAuditEvents,emailVerificationTokens,authChallenges,mfaCredentials,recoveryCodes,and,eq,gt,isNull,lt,sql} from '@qapath/database';
import type {AccountSecurityPort,RestrictedChallenge} from '@qapath/identity';
import {DatabaseProvider} from '../database.provider';
@Injectable()
export class PostgresSecurityAdapter implements AccountSecurityPort {
 constructor(private readonly provider:DatabaseProvider){}
 async createVerification(userId:string,tokenHash:string,expiresAt:Date){
  return this.provider.db.transaction(async tx=>{
   await tx.select({id:users.id}).from(users).where(eq(users.id,userId)).for('update');
   const [recent]=await tx.select({id:emailVerificationTokens.id}).from(emailVerificationTokens)
    .where(and(eq(emailVerificationTokens.userId,userId),isNull(emailVerificationTokens.consumedAt),gt(emailVerificationTokens.createdAt,new Date(Date.now()-60000)))).limit(1);
   if(recent)return false;
   await tx.update(emailVerificationTokens).set({consumedAt:new Date()}).where(and(eq(emailVerificationTokens.userId,userId),isNull(emailVerificationTokens.consumedAt)));
   await tx.insert(emailVerificationTokens).values({userId,tokenHash,expiresAt});
   await tx.insert(adminAuditEvents).values({targetUserId:userId,action:'EMAIL_VERIFICATION_REQUESTED'});return true;
  });
 }
 async consumeVerification(tokenHash:string){
  return this.provider.db.transaction(async tx=>{
   const [record]=await tx.update(emailVerificationTokens).set({consumedAt:new Date()}).where(and(eq(emailVerificationTokens.tokenHash,tokenHash),isNull(emailVerificationTokens.consumedAt),gt(emailVerificationTokens.expiresAt,new Date()))).returning({userId:emailVerificationTokens.userId});
   if(!record)return false;
   await tx.update(users).set({emailVerifiedAt:new Date(),updatedAt:new Date()}).where(eq(users.id,record.userId));
   await tx.insert(adminAuditEvents).values({targetUserId:record.userId,action:'EMAIL_VERIFIED'});return true;
  });
 }
 async createChallenge(userId:string,hash:string,expiresAt:Date){
  await this.provider.db.transaction(async tx=>{
   await tx.update(authChallenges).set({consumedAt:new Date()}).where(and(eq(authChallenges.userId,userId),isNull(authChallenges.consumedAt)));
   await tx.insert(authChallenges).values({userId,tokenHash:hash,expiresAt});
  });
 }
 async findChallenge(hash:string):Promise<RestrictedChallenge|null>{
  const [v]=await this.provider.db.select().from(authChallenges).where(and(eq(authChallenges.tokenHash,hash),isNull(authChallenges.consumedAt),gt(authChallenges.expiresAt,new Date()),lt(authChallenges.attempts,5))).limit(1);
  return v?{id:v.id,userId:v.userId,expiresAt:v.expiresAt,attempts:v.attempts,issuedAt:v.createdAt}:null;
 }
 async recordChallengeFailure(id:string){await this.provider.db.transaction(async tx=>{
  const [challenge]=await tx.update(authChallenges).set({attempts:sql`LEAST(${authChallenges.attempts}+1,5)`}).where(eq(authChallenges.id,id)).returning({userId:authChallenges.userId});
  if(challenge)await tx.insert(adminAuditEvents).values({targetUserId:challenge.userId,action:'MFA_FAILURE'});
 });}
 async consumeChallenge(id:string){const [v]=await this.provider.db.update(authChallenges).set({consumedAt:new Date()}).where(and(eq(authChallenges.id,id),isNull(authChallenges.consumedAt),gt(authChallenges.expiresAt,new Date()))).returning({id:authChallenges.id});return !!v;}
 async replacePassword(userId:string,passwordHash:string){await this.provider.db.transaction(async tx=>{
  await tx.update(users).set({passwordHash,mustChangePassword:false,failedAttempts:0,lockedUntil:null,updatedAt:new Date()}).where(eq(users.id,userId));
  await tx.update(authSessions).set({revokedAt:new Date()}).where(and(eq(authSessions.userId,userId),isNull(authSessions.revokedAt)));
  await tx.insert(adminAuditEvents).values({actorUserId:userId,targetUserId:userId,action:'INITIAL_PASSWORD_CHANGED'});
 });}
 async getMfa(userId:string){
  const [v]=await this.provider.db.select().from(mfaCredentials).where(eq(mfaCredentials.userId,userId)).limit(1);
  return {enabled:!!v?.enabledAt,secretCiphertext:v?.secretCiphertext??null,pendingCiphertext:v?.pendingCiphertext??null,pendingUntil:v?.pendingUntil??null,lastUsedStep:v?.lastUsedStep??-1};
 }
 async savePendingMfa(userId:string,ciphertext:string,expiresAt:Date){
  await this.provider.db.insert(mfaCredentials).values({userId,pendingCiphertext:ciphertext,pendingUntil:expiresAt}).onConflictDoUpdate({target:mfaCredentials.userId,set:{pendingCiphertext:ciphertext,pendingUntil:expiresAt,updatedAt:new Date()}});
 }
 async activateMfa(userId:string,step:number,hashes:string[]){return this.provider.db.transaction(async tx=>{
  const [v]=await tx.update(mfaCredentials).set({secretCiphertext:sql`${mfaCredentials.pendingCiphertext}`,pendingCiphertext:null,pendingUntil:null,enabledAt:new Date(),lastUsedStep:step,updatedAt:new Date()})
   .where(and(eq(mfaCredentials.userId,userId),isNull(mfaCredentials.enabledAt),gt(mfaCredentials.pendingUntil,new Date()))).returning({userId:mfaCredentials.userId});
  if(!v)return false;
  await tx.update(users).set({mfaEnabled:true,updatedAt:new Date()}).where(eq(users.id,userId));
  await tx.update(authSessions).set({revokedAt:new Date()}).where(and(eq(authSessions.userId,userId),isNull(authSessions.revokedAt)));
  await tx.insert(recoveryCodes).values(hashes.map(codeHash=>({userId,codeHash})));
  return true;
 });}
 async claimMfaStep(userId:string,step:number){const [v]=await this.provider.db.update(mfaCredentials).set({lastUsedStep:step}).where(and(eq(mfaCredentials.userId,userId),lt(mfaCredentials.lastUsedStep,step))).returning({userId:mfaCredentials.userId});return !!v;}
 async claimRecoveryCode(userId:string,hash:string){const [v]=await this.provider.db.update(recoveryCodes).set({usedAt:new Date()}).where(and(eq(recoveryCodes.userId,userId),eq(recoveryCodes.codeHash,hash),isNull(recoveryCodes.usedAt))).returning({userId:recoveryCodes.userId});return !!v;}
 async audit(userId:string,action:string){await this.provider.db.insert(adminAuditEvents).values({actorUserId:userId,targetUserId:userId,action});}
}
