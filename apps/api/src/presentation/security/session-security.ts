import {CanActivate,ExecutionContext,ForbiddenException,Inject,Injectable,SetMetadata,UnauthorizedException} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import type {PublicUser,UserRole} from '@qapath/identity';
import {SecureAuthenticationService} from '@qapath/identity';
export const PUBLIC_ROUTE='publicRoute';const REQUIRED_ROLES='requiredRoles';
export const Public=()=>SetMetadata(PUBLIC_ROUTE,true);
export const Roles=(...roles:UserRole[])=>SetMetadata(REQUIRED_ROLES,roles);
export type AuthenticatedRequest={headers:Record<string,string|undefined>;method:string;user?:PublicUser;sessionToken?:string};
export function cookieName(){return process.env.NODE_ENV==='production'?'__Host-qapath_session':'qapath_session';}
export function extractSessionCookie(raw?:string){const name=cookieName();return raw?.split(';').map(c=>c.trim()).find(c=>c.startsWith(name+'='))?.slice(name.length+1);}
const dangerous=new Set(['POST','PUT','PATCH','DELETE']);
@Injectable()
export class OriginGuard implements CanActivate{
 canActivate(ctx:ExecutionContext){
  const req=ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  if(!dangerous.has(req.method.toUpperCase()))return true;
  const origin=req.headers.origin;const fetchSite=req.headers['sec-fetch-site'];
  const allowed=(process.env.WEB_ORIGIN||'http://localhost:3000,http://127.0.0.1:3000').split(',').map(s=>s.trim());
  if(fetchSite==='cross-site'||(origin&&!allowed.includes(origin)))throw new ForbiddenException('Origen no permitido.');
  // Cookie-authenticated writes MUST have Origin (or Fetch Metadata from a same-origin browser).
  if((extractSessionCookie(req.headers.cookie)||req.headers.cookie?.includes('qapath_challenge=')||req.headers.cookie?.includes('__Host-qapath_challenge='))&&!origin&&fetchSite!=='same-origin')throw new ForbiddenException('Origen obligatorio en solicitudes autenticadas.');
  return true;
 }
}
@Injectable()
export class SessionGuard implements CanActivate{
 constructor(private readonly reflector:Reflector,@Inject(SecureAuthenticationService)private readonly auth:SecureAuthenticationService){}
 async canActivate(ctx:ExecutionContext){
  const publicRoute=this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE,[ctx.getHandler(),ctx.getClass()]);
  if(publicRoute)return true;
  const req=ctx.switchToHttp().getRequest<AuthenticatedRequest>();const token=extractSessionCookie(req.headers.cookie);
  if(!token)throw new UnauthorizedException('Debes iniciar sesión.');
  const user=await this.auth.findSession(token);if(!user)throw new UnauthorizedException('Sesión vencida o inválida.');
  req.user=user;req.sessionToken=token;return true;
 }
}
@Injectable()
export class RolesGuard implements CanActivate{
 constructor(private readonly reflector:Reflector){}
 canActivate(ctx:ExecutionContext){
  const required=this.reflector.getAllAndOverride<UserRole[]>(REQUIRED_ROLES,[ctx.getHandler(),ctx.getClass()]);
  if(!required?.length)return true;
  const user=ctx.switchToHttp().getRequest<AuthenticatedRequest>().user;
  if(!user)throw new UnauthorizedException('Debes iniciar sesión.');
  if(!required.includes(user.role))throw new ForbiddenException('Rol insuficiente.');
  return true;
 }
}
