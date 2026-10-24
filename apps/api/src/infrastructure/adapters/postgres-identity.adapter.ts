import {Injectable} from '@nestjs/common';
import {users,authSessions,adminAuditEvents,and,eq,gt,isNull,sql} from '@qapath/database';
import type {IdentityRepository,IdentityUser,SessionPort} from '@qapath/identity';
import {DatabaseProvider} from '../database.provider';
const mapUser=(row:typeof users.$inferSelect):IdentityUser=>({id:row.id,email:row.email,role:row.role,passwordHash:row.passwordHash,failedAttempts:row.failedAttempts,lockedUntil:row.lockedUntil,isActive:row.isActive,emailVerifiedAt:row.emailVerifiedAt,mustChangePassword:row.mustChangePassword,mfaEnabled:row.mfaEnabled,firebaseUid:row.firebaseUid});
@Injectable()
export class PostgresIdentityAdapter implements IdentityRepository {
 constructor(private readonly provider:DatabaseProvider){}
 async findByEmail(email:string){const [user]=await this.provider.db.select().from(users).where(eq(users.email,email)).limit(1);return user?mapUser(user):null;}
 async findById(id:string){const [user]=await this.provider.db.select().from(users).where(eq(users.id,id)).limit(1);return user?mapUser(user):null;}
 async create(input:{email:string;passwordHash:string;role:'STUDENT';firebaseUid?:string}){
  return this.provider.db.transaction(async tx=>{
   const [user]=await tx.insert(users).values(input).returning();
   await tx.insert(adminAuditEvents).values({targetUserId:user.id,action:'STUDENT_REGISTERED'});
   return mapUser(user);
  });
 }
 async linkExternal(id:string,uid:string){
  return this.provider.db.transaction(async tx=>{
   const [user]=await tx.update(users).set({firebaseUid:uid,passwordHash:'external:firebase',emailVerifiedAt:null,updatedAt:new Date()})
    .where(and(eq(users.id,id),isNull(users.firebaseUid))).returning();
   if(!user){const [linked]=await tx.select().from(users).where(and(eq(users.id,id),eq(users.firebaseUid,uid))).limit(1);if(linked)return mapUser(linked);throw new Error('Identidad externa ya vinculada a otra cuenta.');}
   await tx.update(authSessions).set({revokedAt:new Date()}).where(and(eq(authSessions.userId,id),isNull(authSessions.revokedAt)));
   await tx.insert(adminAuditEvents).values({targetUserId:id,action:'FIREBASE_IDENTITY_LINKED'});
   return mapUser(user);
  });
 }
 async syncExternalVerification(id:string,verified:boolean){
  const [user]=await this.provider.db.update(users).set({emailVerifiedAt:verified?sql`COALESCE(${users.emailVerifiedAt}, NOW())`:null,updatedAt:new Date()}).where(eq(users.id,id)).returning();
  return mapUser(user);
 }
 async recordFailure(id:string){await this.provider.db.transaction(async tx=>{
  await tx.update(users).set({failedAttempts:sql`CASE WHEN ${users.failedAttempts} >= 4 THEN 0 ELSE ${users.failedAttempts}+1 END`,lockedUntil:sql`CASE WHEN ${users.failedAttempts} >= 4 THEN NOW() + INTERVAL '15 minutes' ELSE ${users.lockedUntil} END`}).where(eq(users.id,id));
  await tx.insert(adminAuditEvents).values({targetUserId:id,action:'LOGIN_FAILURE'});
 });}
 async resetFailures(id:string){await this.provider.db.update(users).set({failedAttempts:0,lockedUntil:null}).where(eq(users.id,id));}
 async createSession(userId:string,tokenHash:string,expiresAt:Date){await this.provider.db.transaction(async tx=>{await tx.insert(authSessions).values({userId,tokenHash,expiresAt});await tx.insert(adminAuditEvents).values({actorUserId:userId,targetUserId:userId,action:'LOGIN_SUCCESS'});});}
 async findUserByTokenHash(tokenHash:string){
  const [found]=await this.provider.db.select({user:users,issuedAt:authSessions.createdAt}).from(authSessions).innerJoin(users,eq(users.id,authSessions.userId)).where(and(eq(authSessions.tokenHash,tokenHash),isNull(authSessions.revokedAt),gt(authSessions.expiresAt,new Date()),eq(users.isActive,true),sql`${users.emailVerifiedAt} IS NOT NULL`,eq(users.mustChangePassword,false),sql`(${users.role} <> 'ADMIN' OR ${users.mfaEnabled} = true)`)).limit(1);
  return found?{...mapUser(found.user),sessionIssuedAt:found.issuedAt}:null;
 }
 async revoke(tokenHash:string){await this.provider.db.transaction(async tx=>{
  const [s]=await tx.select({userId:authSessions.userId}).from(authSessions).where(eq(authSessions.tokenHash,tokenHash)).limit(1);
  await tx.update(authSessions).set({revokedAt:new Date()}).where(eq(authSessions.tokenHash,tokenHash));
  if(s)await tx.insert(adminAuditEvents).values({actorUserId:s.userId,targetUserId:s.userId,action:'LOGOUT'});
 });}
 // The SessionPort method is named `create` and collides with IdentityRepository.create.
 // Session persistence is supplied via a dedicated delegate in the module.
}
export class PostgresSessionsAdapter implements SessionPort {
 constructor(private readonly adapter:PostgresIdentityAdapter){}
 create(userId:string,tokenHash:string,expiresAt:Date){return this.adapter.createSession(userId,tokenHash,expiresAt);}
 findUserByTokenHash(tokenHash:string){return this.adapter.findUserByTokenHash(tokenHash);}
 revoke(tokenHash:string){return this.adapter.revoke(tokenHash);}
}
