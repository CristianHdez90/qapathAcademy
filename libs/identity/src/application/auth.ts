import type {IdentityRepository,PasswordPort,SessionPort,TokenPort,PublicUser} from '../domain/identity';
import {AccountLocked,AuthConflict,AuthError,publicUser} from '../domain/identity';
import {EmailAddress} from '../domain/email-address';
export type AuthDependencies={users:IdentityRepository;passwords:PasswordPort;sessions:SessionPort;tokens:TokenPort};
/** @deprecated Use SecureAuthenticationService. Kept only for migration tests; not wired in NestJS. */
export class AuthenticationService {
 constructor(private readonly dep:AuthDependencies){}
 async signUp(emailInput:string,password:string):Promise<PublicUser>{
  const email=EmailAddress.create(emailInput).value;
  if(await this.dep.users.findByEmail(email))throw new AuthConflict();
  const passwordHash=await this.dep.passwords.hash(password);
  try{return publicUser(await this.dep.users.create({email,passwordHash,role:'STUDENT'}));}
  catch(error){if((error as {code?:string}).code==='23505')throw new AuthConflict();throw error;}
 }
 async signIn(emailInput:string,password:string):Promise<{user:PublicUser;token:string;expiresAt:Date}>{
  // A common error response prevents account enumeration.
  let email:string;try{email=EmailAddress.create(emailInput).value;}catch{throw new AuthError();}
  const user=await this.dep.users.findByEmail(email);
  // Always perform scrypt, even for unknown accounts (timing mitigation).
  const matches=await this.dep.passwords.verify(password,user?.passwordHash??'');
  if(!user||!matches||!user.isActive){if(user)await this.dep.users.recordFailure(user.id);throw new AuthError();}
  if(user.lockedUntil&&user.lockedUntil>new Date())throw new AccountLocked();
  // Fail closed: the old service must NEVER bypass enrollment or login MFA.
  if(!user.emailVerifiedAt||user.mustChangePassword||user.mfaEnabled||user.role==='ADMIN')throw new AuthError();
  await this.dep.users.resetFailures(user.id);
  const token=this.dep.tokens.issue();const expiresAt=new Date(Date.now()+7*86400_000);
  await this.dep.sessions.create(user.id,this.dep.tokens.hash(token),expiresAt);
  return {user:publicUser(user),token,expiresAt};
 }
 async signOut(token:string):Promise<void>{await this.dep.sessions.revoke(this.dep.tokens.hash(token));}
 async findSession(token:string):Promise<PublicUser|null>{
  const user=await this.dep.sessions.findUserByTokenHash(this.dep.tokens.hash(token));
  return user?.emailVerifiedAt&&!user.mustChangePassword&&!user.mfaEnabled&&user.role!=='ADMIN'?publicUser(user):null;
 }
}
