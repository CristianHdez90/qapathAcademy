import {BadRequestException,Body,Controller,Get,HttpCode,Post,Req,Res,UnauthorizedException,HttpException,HttpStatus,ServiceUnavailableException} from '@nestjs/common';
import {loginSchema,registerSchema,changeInitialPasswordSchema,verifyEmailSchema,verificationResendSchema,mfaCodeSchema,mfaSetupSchema} from '@qapath/contracts';
import {SecureAuthenticationService,AuthConflict,AuthError,AccountLocked,SecurityFlowError} from '@qapath/identity';
import type {AuthOutcome} from '@qapath/identity';
import {Public,AuthenticatedRequest,cookieName,extractSessionCookie} from '../security/session-security';
const lifespan=7*24*60*60;
type CookieResponse={setHeader:(header:string,value:string|string[])=>void};
const secure=()=>process.env.NODE_ENV==='production'?'; Secure':'';
function authCookie(token:string){return `${cookieName()}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${lifespan}${secure()}`;}
function clearAuth(){return `${cookieName()}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure()}`;}
function challengeName(){return process.env.NODE_ENV==='production'?'__Host-qapath_challenge':'qapath_challenge'}
function challengeCookie(token:string){return `${challengeName()}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Strict; Max-Age=600${secure()}`;}
function clearChallenge(){return `${challengeName()}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0${secure()}`;}
function readChallenge(req:AuthenticatedRequest){return req.headers.cookie?.split(';').map(c=>c.trim()).find(c=>c.startsWith(challengeName()+'='))?.slice(challengeName().length+1)??'';}
function setCookies(res:CookieResponse,stage:AuthOutcome){res.setHeader('Set-Cookie',stage.stage==='AUTHENTICATED'?[authCookie(stage.token!),clearChallenge()]:[clearAuth(),challengeCookie(stage.token!)]);}
function handleSecurity(err:unknown):never{
 if(err instanceof AuthError||err instanceof AccountLocked)throw new UnauthorizedException(err.message);
 if(err instanceof SecurityFlowError){if(err.status===401)throw new UnauthorizedException(err.message);if(err.status===429)throw new HttpException(err.message,HttpStatus.TOO_MANY_REQUESTS);if(err.status===503)throw new ServiceUnavailableException(err.message);throw new BadRequestException(err.message)}
 throw err;
}
@Controller('auth')
export class AuthController {
 constructor(private readonly auth:SecureAuthenticationService){}
 @Public() @Get('config') config(){return {data:{provider:this.auth.externalIdentityEnabled?'firebase':'local'}};}
 @Public() @Post('register') async register(@Body()body:unknown){const input=registerSchema.safeParse(body);if(!input.success)throw new BadRequestException('Datos de registro inválidos.');try{return {data:await this.auth.signUp(input.data.email,input.data.password)}}catch(err){if(err instanceof AuthConflict)throw new BadRequestException(err.message);handleSecurity(err)}}
 @Public() @Post('resend-verification') @HttpCode(200) async resend(@Body()body:unknown){const input=verificationResendSchema.safeParse(body);if(!input.success)throw new BadRequestException('Correo inválido.');try{return {data:await this.auth.resendVerification(input.data.email,input.data.password)}}catch(err){handleSecurity(err)}}
 @Public() @Post('verify-email') @HttpCode(200) async verifyEmail(@Body()body:unknown){const input=verifyEmailSchema.safeParse(body);if(!input.success)throw new BadRequestException('Token inválido.');try{return {data:await this.auth.verifyEmail(input.data.token)}}catch(err){handleSecurity(err)}}
 @Public() @Post('login') @HttpCode(200) async login(@Body()body:unknown,@Res({passthrough:true})res:CookieResponse){const input=loginSchema.safeParse(body);if(!input.success)throw new BadRequestException('Credenciales inválidas.');try{const result=await this.auth.signIn(input.data.email,input.data.password);if(result.stage==='VERIFY_EMAIL')res.setHeader('Set-Cookie',[clearAuth(),clearChallenge()]);else setCookies(res,result);return {data:{stage:result.stage,user:result.user}};}catch(err){handleSecurity(err)}}
 @Public() @Get('challenge') async challenge(@Req()req:AuthenticatedRequest){try{return {data:await this.auth.challengeStage(readChallenge(req))}}catch(err){handleSecurity(err)}}
 @Public() @Post('change-initial-password') @HttpCode(200) async changeInitial(@Req()req:AuthenticatedRequest,@Body()body:unknown,@Res({passthrough:true})res:CookieResponse){const input=changeInitialPasswordSchema.safeParse(body);if(!input.success)throw new BadRequestException('La contraseña debe tener entre 12 y 128 caracteres.');try{const result=await this.auth.changeInitialPassword(readChallenge(req),input.data.newPassword);setCookies(res,result);return {data:{stage:result.stage,user:result.user}};}catch(err){handleSecurity(err)}}
 @Public() @Post('mfa/setup') @HttpCode(200) async mfaSetup(@Req()req:AuthenticatedRequest,@Body()body:unknown){const input=mfaSetupSchema.safeParse(body);if(!input.success)throw new BadRequestException('Solicitud inválida.');try{return {data:await this.auth.beginMfa({challengeToken:readChallenge(req)||undefined,sessionToken:extractSessionCookie(req.headers.cookie),password:input.data.password})}}catch(err){handleSecurity(err)}}
 @Public() @Post('mfa/activate') @HttpCode(200) async mfaActivate(@Req()req:AuthenticatedRequest,@Body()body:unknown,@Res({passthrough:true})res:CookieResponse){const input=mfaCodeSchema.safeParse(body);if(!input.success)throw new BadRequestException('Código inválido.');try{const result=await this.auth.activateMfa({challengeToken:readChallenge(req)||undefined,sessionToken:extractSessionCookie(req.headers.cookie),code:input.data.code});if(result.outcome)setCookies(res,result.outcome);return {data:{stage:result.outcome?.stage??'AUTHENTICATED',user:result.outcome?.user,recoveryCodes:result.recoveryCodes}};}catch(err){handleSecurity(err)}}
 @Public() @Post('mfa/verify') @HttpCode(200) async mfaVerify(@Req()req:AuthenticatedRequest,@Body()body:unknown,@Res({passthrough:true})res:CookieResponse){const input=mfaCodeSchema.safeParse(body);if(!input.success)throw new BadRequestException('Código inválido.');try{const result=await this.auth.verifyMfa(readChallenge(req),input.data.code);setCookies(res,result);return {data:{stage:result.stage,user:result.user}};}catch(err){handleSecurity(err)}}
 @Get('me')me(@Req()req:AuthenticatedRequest){return {data:req.user}}
 @Post('logout') @HttpCode(200) async logout(@Req()req:AuthenticatedRequest,@Res({passthrough:true})response:CookieResponse){const token=req.sessionToken??extractSessionCookie(req.headers.cookie);if(token)await this.auth.signOut(token);response.setHeader('Set-Cookie',[clearAuth(),clearChallenge()]);return {data:{success:true}}}
}
