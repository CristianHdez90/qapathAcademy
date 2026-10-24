import {AuthConflict,AuthError,AccountLocked,publicUser} from '../domain/identity';
import type {IdentityRepository,IdentityUser,PasswordPort,SessionPort,TokenPort,PublicUser} from '../domain/identity';
import {EmailAddress} from '../domain/email-address';

export type AuthStage = 'AUTHENTICATED'|'VERIFY_EMAIL'|'CHANGE_PASSWORD'|'MFA_SETUP'|'MFA_VERIFY';
export type AuthOutcome={stage:AuthStage;user?:PublicUser;token?:string;expiresAt?:Date};
export type RestrictedChallenge={id:string;userId:string;expiresAt:Date;attempts:number};
export type TotpEnrollment={uri:string;secret:string};

/** Outbound ports. Domain and application never import Node, Nest, SQL or HTTP. */
export interface AccountSecurityPort {
  createVerification(userId:string,tokenHash:string,expiresAt:Date):Promise<boolean>;
  consumeVerification(tokenHash:string):Promise<boolean>;
  createChallenge(userId:string,hash:string,expiresAt:Date):Promise<void>;
  findChallenge(hash:string):Promise<RestrictedChallenge|null>;
  recordChallengeFailure(id:string):Promise<void>;
  consumeChallenge(id:string):Promise<boolean>;
  replacePassword(userId:string,passwordHash:string):Promise<void>;
  getMfa(userId:string):Promise<{enabled:boolean;secretCiphertext:string|null;pendingCiphertext:string|null;pendingUntil:Date|null;lastUsedStep:number}>;
  savePendingMfa(userId:string,ciphertext:string,expiresAt:Date):Promise<void>;
  activateMfa(userId:string,step:number,recoveryCodeHashes:string[]):Promise<boolean>;
  claimMfaStep(userId:string,step:number):Promise<boolean>;
  claimRecoveryCode(userId:string,hash:string):Promise<boolean>;
  audit(userId:string,action:string):Promise<void>;
}
export interface TotpPort {
  createSecret():string;
  encrypt(secret:string):string;
  decrypt(ciphertext:string):string;
  provisioningUri(email:string,secret:string):string;
  matchingStep(secret:string,code:string,afterStep:number):number|null;
  newRecoveryCodes():string[];
  hashRecoveryCode(code:string):string;
}
export interface VerificationMailer {sendVerification(email:string,token:string):Promise<void>}
export class SecurityFlowError extends Error {constructor(message:string,readonly status:400|401|403|429|503=400){super(message);this.name='SecurityFlowError'}}
export type SecureAuthDependencies={users:IdentityRepository;passwords:PasswordPort;sessions:SessionPort;tokens:TokenPort;security:AccountSecurityPort;totp:TotpPort;mailer:VerificationMailer};
const DAY=86400000;
export class SecureAuthenticationService {
  constructor(private readonly d:SecureAuthDependencies){}
  private async userByEmail(input:string){let email:string;try{email=EmailAddress.create(input).value}catch{throw new AuthError()};return {email,user:await this.d.users.findByEmail(email)}}
  async signUp(emailInput:string,password:string){
    const email=EmailAddress.create(emailInput).value;
    const existing=await this.d.users.findByEmail(email);
    if(existing){await this.sendVerification(existing);return {message:'Si el correo está disponible, enviamos instrucciones de verificación.'};}
    if(password.length<12||password.length>128)throw new SecurityFlowError('Contraseña: entre 12 y 128 caracteres.');
    const passwordHash=await this.d.passwords.hash(password);
    let user:IdentityUser;
    try{user=await this.d.users.create({email,passwordHash,role:'STUDENT'});}catch(err){if((err as {code?:string}).code==='23505')throw new AuthConflict();throw err;}
    await this.sendVerification(user);
    return {message:'Si el correo está disponible, enviamos instrucciones de verificación.'};
  }
  private async sendVerification(user:IdentityUser){
    if(user.emailVerifiedAt||!user.isActive)return;
    const token=this.d.tokens.issue();
    const reserved=await this.d.security.createVerification(user.id,this.d.tokens.hash(token),new Date(Date.now()+DAY));
    if(reserved)await this.d.mailer.sendVerification(user.email,token);
  }
  async resendVerification(emailInput:string){
    // Responses are identical for existing, unknown and verified accounts.
    try{const {user}=await this.userByEmail(emailInput);if(user)await this.sendVerification(user)}catch(err){if(!(err instanceof AuthError))throw err}
    return {message:'Si corresponde, recibirás un enlace de verificación.'};
  }
  async verifyEmail(token:string){
    if(!/^[A-Za-z0-9_-]{32,128}$/.test(token))throw new SecurityFlowError('Enlace inválido o vencido.');
    if(!await this.d.security.consumeVerification(this.d.tokens.hash(token)))throw new SecurityFlowError('Enlace inválido, usado o vencido.');
    return {verified:true};
  }
  private async restricted(userId:string):Promise<string>{
    const token=this.d.tokens.issue();
    await this.d.security.createChallenge(userId,this.d.tokens.hash(token),new Date(Date.now()+10*60000));
    return token;
  }
  private async session(user:IdentityUser):Promise<AuthOutcome>{
    const token=this.d.tokens.issue(),expiresAt=new Date(Date.now()+7*DAY);
    await this.d.sessions.create(user.id,this.d.tokens.hash(token),expiresAt);
    return {stage:'AUTHENTICATED',user:publicUser(user),token,expiresAt};
  }
  private stage(user:IdentityUser):AuthStage{
    if(!user.emailVerifiedAt)return 'VERIFY_EMAIL';
    if(user.mustChangePassword)return 'CHANGE_PASSWORD';
    if(!user.mfaEnabled&&user.role==='ADMIN')return 'MFA_SETUP';
    if(user.mfaEnabled)return 'MFA_VERIFY';
    return 'AUTHENTICATED';
  }
  async signIn(emailInput:string,password:string):Promise<AuthOutcome>{
    const {user}=await this.userByEmail(emailInput);
    const matches=await this.d.passwords.verify(password,user?.passwordHash??'');
    if(!user||!matches||!user.isActive){if(user)await this.d.users.recordFailure(user.id);throw new AuthError();}
    if(user.lockedUntil&&user.lockedUntil>new Date())throw new AccountLocked();
    const stage=this.stage(user);
    await this.d.users.resetFailures(user.id);
    if(stage==='VERIFY_EMAIL')return {stage};
    if(stage!=='AUTHENTICATED')return {stage,token:await this.restricted(user.id)};
    return this.session(user);
  }
  private async challenge(token:string){
    if(!token)throw new SecurityFlowError('Desafío vencido. Vuelve a iniciar sesión.',401);
    const challenge=await this.d.security.findChallenge(this.d.tokens.hash(token));
    if(!challenge||challenge.expiresAt<=new Date()||challenge.attempts>=5)throw new SecurityFlowError('Desafío vencido o agotado. Vuelve a iniciar sesión.',401);
    const user=await this.d.users.findById(challenge.userId);
    if(!user?.isActive||!user.emailVerifiedAt)throw new SecurityFlowError('Acceso no disponible.',401);
    return {challenge,user};
  }
  async challengeStage(token:string):Promise<{stage:AuthStage}>{
    const {user}=await this.challenge(token);return {stage:this.stage(user)};
  }
  async changeInitialPassword(token:string,newPassword:string):Promise<AuthOutcome>{
    const {challenge,user}=await this.challenge(token);
    if(!user.mustChangePassword)throw new SecurityFlowError('No hay cambio inicial pendiente.',403);
    if(newPassword.length<12||newPassword.length>128)throw new SecurityFlowError('Contraseña: entre 12 y 128 caracteres.');
    if(await this.d.passwords.verify(newPassword,user.passwordHash))throw new SecurityFlowError('La nueva contraseña debe ser diferente de la anterior.');
    if(!await this.d.security.consumeChallenge(challenge.id))throw new SecurityFlowError('Desafío ya utilizado.',401);
    await this.d.security.replacePassword(user.id,await this.d.passwords.hash(newPassword));
    const updated=await this.d.users.findById(user.id);if(!updated)throw new AuthError();
    const stage=this.stage(updated);
    if(stage!=='AUTHENTICATED')return {stage,token:await this.restricted(user.id)};
    return this.session(updated);
  }
  async beginMfa(input:{challengeToken?:string;sessionToken?:string;password?:string}):Promise<TotpEnrollment>{
    let user:IdentityUser;
    if(input.challengeToken){const value=await this.challenge(input.challengeToken);user=value.user;if(this.stage(user)!=='MFA_SETUP')throw new SecurityFlowError('El alta MFA no corresponde a este desafío.',403);}
    else{
      user=await this.sessionUser(input.sessionToken);
      if(!input.password||!await this.d.passwords.verify(input.password,user.passwordHash))throw new AuthError();
    }
    if(user.mfaEnabled)throw new SecurityFlowError('MFA ya está activo.',403);
    const secret=this.d.totp.createSecret();
    await this.d.security.savePendingMfa(user.id,this.d.totp.encrypt(secret),new Date(Date.now()+10*60000));
    return {secret,uri:this.d.totp.provisioningUri(user.email,secret)};
  }
  async activateMfa(input:{challengeToken?:string;sessionToken?:string;code:string}):Promise<{outcome?:AuthOutcome;recoveryCodes:string[]}>{
    const data=input.challengeToken?await this.challenge(input.challengeToken):null;
    const user=data?.user??await this.sessionUser(input.sessionToken);
    if(user.mfaEnabled)throw new SecurityFlowError('MFA ya está configurado.',403);
    const mfa=await this.d.security.getMfa(user.id);
    if(!mfa.pendingCiphertext||!mfa.pendingUntil||mfa.pendingUntil<=new Date())throw new SecurityFlowError('La configuración MFA expiró.');
    const step=this.d.totp.matchingStep(this.d.totp.decrypt(mfa.pendingCiphertext),input.code,-1);
    if(step===null){if(data)await this.d.security.recordChallengeFailure(data.challenge.id);throw new SecurityFlowError('Código MFA incorrecto.',401)}
    const codes=this.d.totp.newRecoveryCodes();
    if(!await this.d.security.activateMfa(user.id,step,codes.map(c=>this.d.totp.hashRecoveryCode(c))))throw new SecurityFlowError('La configuración MFA ya fue utilizada.');
    await this.d.security.audit(user.id,'MFA_ENABLED');
    if(data){if(!await this.d.security.consumeChallenge(data.challenge.id))throw new SecurityFlowError('Desafío usado.',401);
      const updated=await this.d.users.findById(user.id);if(!updated)throw new AuthError();
      return {outcome:await this.session(updated),recoveryCodes:codes};
    }
    const updated=await this.d.users.findById(user.id);if(!updated)throw new AuthError();
    return {outcome:await this.session(updated),recoveryCodes:codes};
  }
  async verifyMfa(token:string,code:string):Promise<AuthOutcome>{
    const {challenge,user}=await this.challenge(token);
    if(this.stage(user)!=='MFA_VERIFY')throw new SecurityFlowError('Este desafío no requiere MFA.',403);
    const mfa=await this.d.security.getMfa(user.id);if(!mfa.enabled||!mfa.secretCiphertext)throw new SecurityFlowError('MFA no disponible.',403);
    let accepted=false;
    const step=this.d.totp.matchingStep(this.d.totp.decrypt(mfa.secretCiphertext),code,mfa.lastUsedStep);
    if(step!==null)accepted=await this.d.security.claimMfaStep(user.id,step);
    // Recovery codes are separately generated at enrollment and are single use.
    else if(/^[A-Za-z0-9-]{12,40}$/.test(code))accepted=await this.d.security.claimRecoveryCode(user.id,this.d.totp.hashRecoveryCode(code));
    if(!accepted){await this.d.security.recordChallengeFailure(challenge.id);throw new SecurityFlowError('Código inválido o utilizado.',401)}
    if(!await this.d.security.consumeChallenge(challenge.id))throw new SecurityFlowError('Desafío ya usado.',401);
    return this.session(user);
  }
  private async sessionUser(token?:string){
    if(!token)throw new SecurityFlowError('Debes iniciar sesión.',401);
    const user=await this.d.sessions.findUserByTokenHash(this.d.tokens.hash(token));
    if(!user||!user.emailVerifiedAt||user.mustChangePassword||(user.role==='ADMIN'&&!user.mfaEnabled))throw new SecurityFlowError('Sesión inválida.',401);
    return user;
  }
  async findSession(token:string):Promise<PublicUser|null>{try{return publicUser(await this.sessionUser(token))}catch{return null}}
  async signOut(token:string){await this.d.sessions.revoke(this.d.tokens.hash(token))}
}
