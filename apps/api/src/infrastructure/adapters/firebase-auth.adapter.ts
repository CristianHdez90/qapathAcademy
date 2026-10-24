import {Injectable} from '@nestjs/common';
import {AuthConflict,AuthError,SecurityFlowError} from '@qapath/identity';
import type {ExternalIdentity,ExternalIdentityPort} from '@qapath/identity';
import {applicationDefault,cert,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import type {Auth} from 'firebase-admin/auth';

const providerCodes=new Set(['EMAIL_EXISTS','TOO_MANY_ATTEMPTS_TRY_LATER','QUOTA_EXCEEDED','INVALID_OOB_CODE','EXPIRED_OOB_CODE',
 'INVALID_LOGIN_CREDENTIALS','INVALID_PASSWORD','EMAIL_NOT_FOUND','USER_DISABLED','INVALID_ID_TOKEN','TOKEN_EXPIRED',
 'API_KEY_INVALID','INVALID_API_KEY','API_KEY_HTTP_REFERRER_BLOCKED','API_KEY_IP_ADDRESS_BLOCKED','API_KEY_SERVICE_BLOCKED',
 'SERVICE_DISABLED','PROJECT_NOT_FOUND','CONFIGURATION_NOT_FOUND','OPERATION_NOT_ALLOWED','UNAUTHORIZED_DOMAIN',
 'INVALID_CONTINUE_URI','MISSING_CONTINUE_URI','INVALID_EMAIL','WEAK_PASSWORD']);
type ProviderError={message?:string;details?:{reason?:string}[]};
function safeProviderCode(error?:ProviderError){
 const candidates=[error?.message?.split(' : ')[0],...(error?.details?.map(detail=>detail.reason)||[])];
 return candidates.find((code):code is string=>!!code&&providerCodes.has(code))||'UNKNOWN';
}
const configurationErrors:Record<string,string>={
 OPERATION_NOT_ALLOWED:'Habilita Correo electrónico/contraseña en Firebase Authentication.',
 UNAUTHORIZED_DOMAIN:'Autoriza el dominio del frontend en Firebase Authentication → Configuración → Dominios autorizados.',
 INVALID_CONTINUE_URI:'APP_URL debe ser la URL HTTPS válida del frontend.',
 MISSING_CONTINUE_URI:'Configura APP_URL con la URL HTTPS del frontend.',
 API_KEY_INVALID:'Comprueba FIREBASE_WEB_API_KEY: copia apiKey del mismo proyecto Firebase, sin comillas.',
 INVALID_API_KEY:'Comprueba FIREBASE_WEB_API_KEY: copia apiKey del mismo proyecto Firebase, sin comillas.',
 API_KEY_HTTP_REFERRER_BLOCKED:'La API key exige un referente de navegador. Configura una clave para las llamadas del backend a Firebase Authentication.',
 API_KEY_IP_ADDRESS_BLOCKED:'Las restricciones de IP de la API key bloquean al backend.',
 API_KEY_SERVICE_BLOCKED:'Las restricciones de la API key deben permitir Identity Toolkit API para Firebase Authentication.',
 SERVICE_DISABLED:'Habilita la API de Authentication (Identity Toolkit) en el proyecto Firebase.',
 PROJECT_NOT_FOUND:'Comprueba que la API key y FIREBASE_PROJECT_ID correspondan al mismo proyecto.',
 CONFIGURATION_NOT_FOUND:'Inicializa Firebase Authentication y habilita Correo electrónico/contraseña en ese proyecto.',
};

export function readFirebaseAuthConfig(env:NodeJS.ProcessEnv=process.env){
 const projectId=env.FIREBASE_PROJECT_ID?.trim();
 const apiKey=env.FIREBASE_WEB_API_KEY?.trim();
 const emulator=env.FIREBASE_AUTH_EMULATOR_HOST?.trim();
 if(!projectId||!apiKey)throw new Error('Firebase Authentication: configura FIREBASE_PROJECT_ID y FIREBASE_WEB_API_KEY.');
 if(emulator&&(env.NODE_ENV==='production'||env.VERCEL==='1'))throw new Error('El emulador Firebase Auth no está permitido en producción.');
 const clientEmail=env.FIREBASE_SERVICE_ACCOUNT_EMAIL?.trim();
 const privateKey=env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g,'\n').trim();
 if(!emulator&&!env.GOOGLE_APPLICATION_CREDENTIALS&&(!clientEmail||!privateKey?.includes('BEGIN PRIVATE KEY')))
  throw new Error('Firebase Authentication: configura credenciales Admin del mismo proyecto.');
 return {projectId,apiKey,emulator,clientEmail,privateKey};
}

@Injectable()
export class FirebaseAuthAdapter implements ExternalIdentityPort {
 private adminInstance?:Auth;
 private admin(){
  if(this.adminInstance)return this.adminInstance;
  const c=readFirebaseAuthConfig();
  const name='qapath-auth';
  const app=getApps().find(a=>a.name===name)??initializeApp({projectId:c.projectId,
   ...(c.emulator?{}:{credential:process.env.GOOGLE_APPLICATION_CREDENTIALS?applicationDefault():cert({projectId:c.projectId,clientEmail:c.clientEmail!,privateKey:c.privateKey!})})},name);
  return this.adminInstance=getAuth(app);
 }
 private async request<T>(operation:string,body:Record<string,unknown>):Promise<T>{
  const c=readFirebaseAuthConfig();
  const base=c.emulator?`http://${c.emulator}/identitytoolkit.googleapis.com/v1`:'https://identitytoolkit.googleapis.com/v1';
  let response:Response;
  try{response=await fetch(`${base}/accounts:${operation}?key=${encodeURIComponent(c.apiKey)}`,{
   method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000),
  });}catch{throw new SecurityFlowError('Firebase Authentication no está disponible. Reintenta más tarde.',503);}
  const data=await response.json() as T&{error?:ProviderError};
  if(!response.ok){
   const code=safeProviderCode(data.error);
   // Log only enumerated codes and fixed operations, never provider text or request payloads.
   const safeOperation=['signUp','signInWithPassword','sendOobCode','update'].includes(operation)?operation:'unknown';
   console.warn(`FirebaseAuth operation=${safeOperation} status=${response.status} code=${code}`);
   if(code==='EMAIL_EXISTS')throw new AuthConflict();
   if(code==='TOO_MANY_ATTEMPTS_TRY_LATER'||code==='QUOTA_EXCEEDED'||response.status===429)throw new SecurityFlowError('Se alcanzó el límite de solicitudes. Inténtalo más tarde.',429);
   if(code==='INVALID_OOB_CODE'||code==='EXPIRED_OOB_CODE')throw new SecurityFlowError('Enlace inválido, usado o vencido.');
   if(['INVALID_LOGIN_CREDENTIALS','INVALID_PASSWORD','EMAIL_NOT_FOUND','USER_DISABLED','INVALID_ID_TOKEN','TOKEN_EXPIRED'].includes(code))throw new AuthError();
   if(configurationErrors[code])throw new SecurityFlowError(`Firebase Authentication [${code}]: ${configurationErrors[code]}`,503);
   throw new SecurityFlowError(`Firebase Authentication rechazó la operación [${code}]. Revisa el código de diagnóstico en los logs de la API.`,503);
  }
  return data;
 }
 private async fromToken(idToken:string):Promise<ExternalIdentity>{
  try{
   // Verify signature, issuer, audience, expiry AND revocation; never decode and trust a JWT.
   const token=await this.admin().verifyIdToken(idToken,true);
   if(token.firebase.sign_in_provider!=='password'||!token.email)throw new AuthError();
   return {uid:token.uid,email:token.email.trim().toLowerCase(),emailVerified:token.email_verified===true};
  }catch(error){
   if(error instanceof AuthError)throw error;
   const code=(error as {code?:string}).code||'';
   if(['auth/id-token-expired','auth/id-token-revoked','auth/argument-error','auth/invalid-id-token','auth/user-disabled','auth/user-not-found'].includes(code))throw new AuthError();
   throw new SecurityFlowError('No fue posible validar la identidad Firebase. Comprueba las credenciales Admin y sus permisos de Authentication.',503);
  }
 }
 private async credentials(email:string,password:string){
  const response=await this.request<{idToken:string}>('signInWithPassword',{email,password,returnSecureToken:true});
  return {token:response.idToken,identity:await this.fromToken(response.idToken)};
 }
 async register(email:string,password:string){
  try{const response=await this.request<{idToken:string}>('signUp',{email,password,returnSecureToken:true});return await this.fromToken(response.idToken);}
  catch(error){
   // Recover a provider account whose previous PostgreSQL insert failed, only with its password.
   if(error instanceof AuthConflict){try{return await this.authenticate(email,password)}catch{throw new AuthConflict();}}
   throw error;
  }
 }
 async authenticate(email:string,password:string){return (await this.credentials(email,password)).identity;}
 async migrate(email:string,password:string){
  try{await this.admin().getUserByEmail(email)}catch(error){
   if((error as {code?:string}).code!=='auth/user-not-found')throw new SecurityFlowError('No fue posible vincular la cuenta con Firebase.',503);
   try{await this.admin().createUser({email,password,emailVerified:false})}catch(createError){
    if((createError as {code?:string}).code!=='auth/email-already-exists')throw new SecurityFlowError('No fue posible crear la identidad Firebase.',503);
   }
  }
  return this.authenticate(email,password);
 }
 async sendVerification(email:string,password:string){
  const {token,identity}=await this.credentials(email,password);
  if(identity.emailVerified)return;
  await this.request('sendOobCode',{requestType:'VERIFY_EMAIL',idToken:token,continueUrl:`${process.env.APP_URL?.replace(/\/$/,'')}/verify-email`});
 }
 async verifyEmail(code:string){
  const response=await this.request<{email:string}>('update',{oobCode:code});
  const user=await this.admin().getUserByEmail(response.email);
  if(user.disabled||!user.emailVerified)throw new AuthError();
  return {uid:user.uid,email:user.email!.toLowerCase(),emailVerified:user.emailVerified};
 }
 async changePassword(uid:string,password:string){
  try{await this.admin().updateUser(uid,{password});}catch{throw new SecurityFlowError('No fue posible actualizar la contraseña en Firebase.',503);}
 }
 async changeEmail(uid:string,email:string){
  try{await this.admin().updateUser(uid,{email,emailVerified:false});await this.admin().revokeRefreshTokens(uid);}
  catch{throw new SecurityFlowError('No fue posible actualizar Firebase. Reintenta guardar el correo para sincronizar la cuenta.',503);}
 }
 async validSession(uid:string,email:string,issuedAt?:Date){
  if(!issuedAt)return false;
  try{const user=await this.admin().getUser(uid);
   return !user.disabled&&user.emailVerified&&user.email?.toLowerCase()===email&&
    (!user.tokensValidAfterTime||issuedAt.getTime()>=new Date(user.tokensValidAfterTime).getTime());
  }catch{return false;}
 }
}
