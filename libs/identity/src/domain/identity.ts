export type UserRole = 'STUDENT'|'INSTRUCTOR'|'ADMIN';
export type IdentityUser = {id:string;email:string;role:UserRole;passwordHash:string;failedAttempts:number;lockedUntil:Date|null;isActive:boolean;emailVerifiedAt:Date|null;mustChangePassword:boolean;mfaEnabled:boolean;firebaseUid?:string|null;sessionIssuedAt?:Date};
export type PublicUser = Pick<IdentityUser,'id'|'email'|'role'|'mfaEnabled'>;
export interface IdentityRepository {
  findByEmail(email:string):Promise<IdentityUser|null>;
  findById(id:string):Promise<IdentityUser|null>;
  create(input:{email:string;passwordHash:string;role:'STUDENT';firebaseUid?:string}):Promise<IdentityUser>;
  linkExternal(id:string,uid:string):Promise<IdentityUser>;
  syncExternalVerification(id:string,verified:boolean):Promise<IdentityUser>;
  recordFailure(id:string):Promise<void>;
  resetFailures(id:string):Promise<void>;
}
export interface PasswordPort { hash(password:string):Promise<string>; verify(password:string,hash:string):Promise<boolean>; }
export interface SessionPort {
  create(userId:string,tokenHash:string,expiresAt:Date):Promise<void>;
  findUserByTokenHash(tokenHash:string):Promise<IdentityUser|null>;
  revoke(tokenHash:string):Promise<void>;
}
export interface TokenPort { issue():string; hash(raw:string):string; }
export class AuthError extends Error {constructor(){super('Correo o contraseña incorrectos.');this.name='AuthError';}}
export class AuthConflict extends Error {constructor(){super('No se pudo crear la cuenta con ese correo.');this.name='AuthConflict';}}
export class AccountLocked extends Error {constructor(){super('Cuenta temporalmente bloqueada. Inténtalo más tarde.');this.name='AccountLocked';}}
export function publicUser(user:IdentityUser):PublicUser {return {id:user.id,email:user.email,role:user.role,mfaEnabled:user.mfaEnabled};}
export function canManageContent(role:UserRole):boolean{return role==='INSTRUCTOR'||role==='ADMIN';}
export function canManageUsers(role:UserRole):boolean{return role==='ADMIN';}
