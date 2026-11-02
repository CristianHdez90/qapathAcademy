/** Provider-neutral credential boundary; tokens are verified by infrastructure. */
export type ExternalIdentity={uid:string;email:string;emailVerified:boolean};
export interface ExternalIdentityPort {
 register(email:string,password:string):Promise<ExternalIdentity>;
 authenticate(email:string,password:string):Promise<ExternalIdentity>;
 migrate(email:string,password:string):Promise<ExternalIdentity>;
 sendVerification(email:string,password:string):Promise<void>;
 verifyEmail(code:string):Promise<ExternalIdentity>;
 changePassword(uid:string,password:string):Promise<void>;
 changeEmail(uid:string,email:string):Promise<void>;
 validSession(uid:string,email:string,issuedAt?:Date):Promise<boolean>;
 /** «¿Olvidaste tu contraseña?»: el proveedor envía su enlace de restablecimiento. */
 sendPasswordReset?(email:string):Promise<void>;
 /** Aplica la contraseña nueva con el código del enlace; devuelve el correo de la cuenta. */
 confirmPasswordReset?(code:string,newPassword:string):Promise<{email:string}>;
}
