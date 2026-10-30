import {AuthConflict,AuthError,AccountLocked,publicUser} from '../domain/identity';
import type {IdentityRepository,IdentityUser,PasswordPort,SessionPort,TokenPort,PublicUser} from '../domain/identity';
import {EmailAddress} from '../domain/email-address';
import type {ExternalIdentityPort} from '../domain/external-identity';

export type AuthStage = 'AUTHENTICATED'|'VERIFY_EMAIL'|'CHANGE_PASSWORD'|'MFA_SETUP'|'MFA_VERIFY';
export type AuthOutcome={stage:AuthStage;user?:PublicUser;token?:string;expiresAt?:Date};
export type RestrictedChallenge={id:string;userId:string;expiresAt:Date;attempts:number;issuedAt?:Date};
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
  /** Reserva un enlace de restablecimiento MFA (anula los anteriores). false si se pidió hace menos de 60 s. */
  createMfaReset(userId:string,tokenHash:string,expiresAt:Date):Promise<boolean>;
  /** Consume el enlace y restablece MFA en la misma transacción. Devuelve el usuario afectado o null. */
  consumeMfaReset(tokenHash:string):Promise<string|null>;
  /** Restablecimiento administrativo: borra la credencial y los códigos, revoca sesiones y audita al actor. */
  resetMfa(userId:string,actorUserId:string,reason:'ADMIN'):Promise<void>;
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
export interface VerificationMailer {sendVerification(email:string,token:string):Promise<void>;sendMfaReset?(email:string,token:string):Promise<void>}
export class SecurityFlowError extends Error {constructor(message:string,readonly status:400|401|403|429|503=400){super(message);this.name='SecurityFlowError'}}
export type SecureAuthDependencies={users:IdentityRepository;passwords:PasswordPort;sessions:SessionPort;tokens:TokenPort;security:AccountSecurityPort;totp:TotpPort;mailer:VerificationMailer;external?:ExternalIdentityPort};
const DAY=86400000;
export class SecureAuthenticationService {
  constructor(private readonly d:SecureAuthDependencies){}
  get externalIdentityEnabled(){return !!this.d.external;}
  private async userByEmail(input:string){let email:string;try{email=EmailAddress.create(input).value}catch{throw new AuthError()};return {email,user:await this.d.users.findByEmail(email)}}
  async signUp(emailInput:string,password:string){
    const email=EmailAddress.create(emailInput).value;
    const existing=await this.d.users.findByEmail(email);
    if(existing){if(!this.d.external)await this.sendVerification(existing);return {message:'Si el correo está disponible, enviamos instrucciones de verificación.'};}
    if(password.length<12||password.length>128)throw new SecurityFlowError('Contraseña: entre 12 y 128 caracteres.');
    const external=await this.d.external?.register(email,password);
    const passwordHash=external?'external:firebase':await this.d.passwords.hash(password);
    let user:IdentityUser;
    try{user=await this.d.users.create({email,passwordHash,role:'STUDENT',...(external?{firebaseUid:external.uid}:{})});}catch(err){if((err as {code?:string}).code==='23505')throw new AuthConflict();throw err;}
    if(this.d.external)await this.externalVerification(user,password);else await this.sendVerification(user);
    return {message:'Si el correo está disponible, enviamos instrucciones de verificación.'};
  }
  private async sendVerification(user:IdentityUser){
    if(user.emailVerifiedAt||!user.isActive)return;
    const token=this.d.tokens.issue();
    const reserved=await this.d.security.createVerification(user.id,this.d.tokens.hash(token),new Date(Date.now()+DAY));
    if(reserved)await this.d.mailer.sendVerification(user.email,token);
  }
  async resendVerification(emailInput:string,password?:string){
    if(this.d.external){
      if(!password)throw new SecurityFlowError('Introduce tu contraseña para reenviar la verificación.');
      const {user}=await this.userByEmail(emailInput);
      if(!user||!user.isActive)return {message:'Si corresponde, recibirás un enlace de verificación.'};
      if(user.lockedUntil&&user.lockedUntil>new Date())throw new AccountLocked();
      let linked:IdentityUser;
      try{linked=await this.externalCredentials(user,password)}catch(error){if(!(error instanceof AuthError))throw error;await this.d.users.recordFailure(user.id);return {message:'Si el correo y la contraseña son correctos, recibirás un enlace de verificación.'}}
      // Con la contraseña correcta ya se demostró la titularidad: se puede informar el estado real sin revelar cuentas a terceros.
      if(linked.emailVerifiedAt)return {message:'Tu correo ya está verificado. Ya puedes iniciar sesión.',verified:true};
      const sent=await this.externalVerification(linked,password);
      return sent?{message:'Te enviamos un nuevo enlace de verificación. Revisa también la carpeta de spam o promociones.',sent:true}
       :{message:'Ya enviamos un enlace hace poco. Revisa tu correo (también spam) o inténtalo de nuevo en unos minutos.'};
    }
    // Responses are identical for existing, unknown and verified accounts.
    try{const {user}=await this.userByEmail(emailInput);if(user)await this.sendVerification(user)}catch(err){if(!(err instanceof AuthError))throw err}
    return {message:'Si corresponde, recibirás un enlace de verificación.'};
  }
  async verifyEmail(token:string){
    if(this.d.external){
      const verified=await this.d.external.verifyEmail(token);
      const user=await this.d.users.findByEmail(verified.email);
      if(!user?.isActive||user.firebaseUid!==verified.uid||!verified.emailVerified)throw new SecurityFlowError('La cuenta no está vinculada a esta identidad.');
      await this.d.users.syncExternalVerification(user.id,true);
      await this.d.security.audit(user.id,'EMAIL_VERIFIED');
      return {verified:true};
    }
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
    let {user}=await this.userByEmail(emailInput);
    if(user?.lockedUntil&&user.lockedUntil>new Date())throw new AccountLocked();
    let matches=false;
    if(this.d.external&&user?.isActive){
      try{user=await this.externalCredentials(user,password);matches=true}catch(error){if(!(error instanceof AuthError))throw error}
    }else if(!this.d.external){matches=await this.d.passwords.verify(password,user?.passwordHash??'');}
    if(!user||!matches||!user.isActive){if(user)await this.d.users.recordFailure(user.id);throw new AuthError();}
    if(user.lockedUntil&&user.lockedUntil>new Date())throw new AccountLocked();
    const stage=this.stage(user);
    await this.d.users.resetFailures(user.id);
    if(stage==='VERIFY_EMAIL'){if(this.d.external)await this.externalVerification(user,password);return {stage};}
    if(stage!=='AUTHENTICATED')return {stage,token:await this.restricted(user.id)};
    return this.session(user);
  }
  private async challenge(token:string){
    if(!token)throw new SecurityFlowError('Desafío vencido. Vuelve a iniciar sesión.',401);
    const challenge=await this.d.security.findChallenge(this.d.tokens.hash(token));
    if(!challenge||challenge.expiresAt<=new Date()||challenge.attempts>=5)throw new SecurityFlowError('Desafío vencido o agotado. Vuelve a iniciar sesión.',401);
    const user=await this.d.users.findById(challenge.userId);
    if(!user?.isActive||!user.emailVerifiedAt)throw new SecurityFlowError('Acceso no disponible.',401);
    if(this.d.external&&(!user.firebaseUid||!await this.d.external.validSession(user.firebaseUid,user.email,challenge.issuedAt)))throw new AuthError();
    return {challenge,user};
  }
  async challengeStage(token:string):Promise<{stage:AuthStage}>{
    const {user}=await this.challenge(token);return {stage:this.stage(user)};
  }
  async changeInitialPassword(token:string,newPassword:string):Promise<AuthOutcome>{
    const {challenge,user}=await this.challenge(token);
    if(!user.mustChangePassword)throw new SecurityFlowError('No hay cambio inicial pendiente.',403);
    if(newPassword.length<12||newPassword.length>128)throw new SecurityFlowError('Contraseña: entre 12 y 128 caracteres.');
    if(this.d.external&&user.firebaseUid){
      let same=false;try{await this.d.external.authenticate(user.email,newPassword);same=true}catch(error){if(!(error instanceof AuthError))throw error}
      if(same)throw new SecurityFlowError('La nueva contraseña debe ser diferente de la anterior.');
    }else if(await this.d.passwords.verify(newPassword,user.passwordHash))throw new SecurityFlowError('La nueva contraseña debe ser diferente de la anterior.');
    if(!await this.d.security.consumeChallenge(challenge.id))throw new SecurityFlowError('Desafío ya utilizado.',401);
    if(this.d.external&&user.firebaseUid)await this.d.external.changePassword(user.firebaseUid,newPassword);
    await this.d.security.replacePassword(user.id,this.d.external?'external:firebase':await this.d.passwords.hash(newPassword));
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
      if(!input.password)throw new AuthError();
      if(this.d.external){const identity=await this.d.external.authenticate(user.email,input.password);if(identity.uid!==user.firebaseUid||!identity.emailVerified)throw new AuthError();}
      else if(!await this.d.passwords.verify(input.password,user.passwordHash))throw new AuthError();
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
  /** «¿Perdiste tu app?»: solo desde un desafío MFA_VERIFY vigente (la contraseña ya se comprobó). */
  async requestMfaReset(challengeToken:string){
    const {user}=await this.challenge(challengeToken);
    if(this.stage(user)!=='MFA_VERIFY')throw new SecurityFlowError('Este desafío no requiere MFA.',403);
    if(this.d.external||!this.d.mailer.sendMfaReset)throw new SecurityFlowError('El restablecimiento por correo no está disponible. Pide a un administrador que restablezca tu MFA.',503);
    const token=this.d.tokens.issue();
    if(await this.d.security.createMfaReset(user.id,this.d.tokens.hash(token),new Date(Date.now()+30*60000)))await this.d.mailer.sendMfaReset(user.email,token);
    return {message:'Te enviamos un enlace al correo de la cuenta. Vence en 30 minutos y solo puede usarse una vez.'};
  }
  async confirmMfaReset(token:string){
    if(!/^[A-Za-z0-9_-]{32,128}$/.test(token))throw new SecurityFlowError('Enlace inválido o vencido.');
    const userId=await this.d.security.consumeMfaReset(this.d.tokens.hash(token));
    if(!userId)throw new SecurityFlowError('Enlace inválido, usado o vencido.');
    return {reset:true};
  }
  async resetMfaByAdmin(targetEmail:string,actorUserId:string){
    let email:string;try{email=EmailAddress.create(targetEmail).value}catch{throw new SecurityFlowError('Correo inválido.')}
    const target=await this.d.users.findByEmail(email);
    if(!target)throw new SecurityFlowError('No existe una cuenta con ese correo.');
    if(target.id===actorUserId)throw new SecurityFlowError('No puedes restablecer tu propio MFA desde Administración. Usa «¿Perdiste tu app?» al iniciar sesión.',403);
    await this.d.security.resetMfa(target.id,actorUserId,'ADMIN');
    return {reset:true,email:target.email,role:target.role};
  }
  private async sessionUser(token?:string){
    if(!token)throw new SecurityFlowError('Debes iniciar sesión.',401);
    const user=await this.d.sessions.findUserByTokenHash(this.d.tokens.hash(token));
    if(!user||!user.emailVerifiedAt||user.mustChangePassword||(user.role==='ADMIN'&&!user.mfaEnabled))throw new SecurityFlowError('Sesión inválida.',401);
    if(this.d.external&&(!user.firebaseUid||!await this.d.external.validSession(user.firebaseUid,user.email,user.sessionIssuedAt)))throw new AuthError();
    return user;
  }
  private async externalCredentials(user:IdentityUser,password:string){
    const provider=this.d.external!;
    if(!user.firebaseUid){
      // Possession of a matching email alone never links a pre-existing PostgreSQL account.
      if(!await this.d.passwords.verify(password,user.passwordHash))throw new AuthError();
      const migrated=await provider.migrate(user.email,password);
      if(migrated.email!==user.email)throw new AuthError();
      user=await this.d.users.linkExternal(user.id,migrated.uid);
    }
    const identity=await provider.authenticate(user.email,password);
    if(identity.uid!==user.firebaseUid||identity.email!==user.email)throw new AuthError();
    return this.d.users.syncExternalVerification(user.id,identity.emailVerified);
  }
  private async externalVerification(user:IdentityUser,password:string){
    if(user.emailVerifiedAt||!user.isActive)return false;
    const allowed=await this.d.security.createVerification(user.id,this.d.tokens.hash(this.d.tokens.issue()),new Date(Date.now()+DAY));
    if(allowed)await this.d.external!.sendVerification(user.email,password);
    return allowed;
  }
  async updateExternalEmail(userId:string,email:string){
    if(!this.d.external)return;
    const user=await this.d.users.findById(userId);
    if(user?.firebaseUid)await this.d.external.changeEmail(user.firebaseUid,email);
  }
  async findSession(token:string):Promise<PublicUser|null>{try{return publicUser(await this.sessionUser(token))}catch{return null}}
  async signOut(token:string){await this.d.sessions.revoke(this.d.tokens.hash(token))}
}
