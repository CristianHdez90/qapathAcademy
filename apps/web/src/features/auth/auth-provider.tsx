'use client';
import {createContext,useCallback,useContext,useEffect,useMemo,useState} from 'react';
import type {ReactNode} from 'react';
import type {AuthUserDTO,LoginOutcomeDTO} from '@qapath/contracts';
export type AuthContextValue={user:AuthUserDTO|null;loading:boolean;authError:string;signIn:(email:string,password:string)=>Promise<LoginOutcomeDTO>;signUp:(email:string,password:string)=>Promise<{message:string}>;signOut:()=>Promise<void>;refresh:()=>Promise<void>;complete:(outcome:LoginOutcomeDTO)=>void};
const Context=createContext<AuthContextValue|null>(null);
export class AuthApiError extends Error {constructor(readonly status:number,message:string){super(message)}}
export async function authRequest<T>(path:string,method:'GET'|'POST'='GET',payload?:unknown):Promise<T>{
 const response=await fetch(`/api/v1${path}`,{method,headers:{Accept:'application/json',...(payload?{'Content-Type':'application/json'}:{})},body:payload?JSON.stringify(payload):undefined,credentials:'same-origin',cache:'no-store'});
 let body:{data?:T;message?:string|string[];error?:{message?:string}}={};try{body=await response.json()}catch{}
 if(!response.ok)throw new AuthApiError(response.status,Array.isArray(body.message)?body.message.join('; '):typeof body.message==='string'?body.message:(body.error?.message??`Error HTTP ${response.status}`));
 return body.data as T;
}
export function AuthProvider({children}:{children:ReactNode}){
 const [user,setUser]=useState<AuthUserDTO|null>(null);const [loading,setLoading]=useState(true);const [authError,setAuthError]=useState('');
 const refresh=useCallback(async()=>{try{setUser(await authRequest<AuthUserDTO>('/auth/me'))}catch(error){setUser(null);if(!(error instanceof AuthApiError&&error.status===401))setAuthError('No fue posible verificar la sesión.')}},[]);
 useEffect(()=>{
  let mounted=true;
  void authRequest<AuthUserDTO>('/auth/me').then(current=>{if(mounted)setUser(current)}).catch(error=>{
   if(!mounted)return;
   setUser(null);
   if(!(error instanceof AuthApiError&&error.status===401))setAuthError('No fue posible verificar la sesión.');
  }).finally(()=>{if(mounted)setLoading(false)});
  return()=>{mounted=false};
 },[]);
 const complete=useCallback((outcome:LoginOutcomeDTO)=>{if(outcome.stage==='AUTHENTICATED'&&outcome.user)setUser(outcome.user);else setUser(null)},[]);
 const signIn=useCallback(async(email:string,password:string)=>{const outcome=await authRequest<LoginOutcomeDTO>('/auth/login','POST',{email,password});complete(outcome);return outcome},[complete]);
 const signUp=useCallback(async(email:string,password:string)=>authRequest<{message:string}>('/auth/register','POST',{email,password}),[]);
 const signOut=useCallback(async()=>{await authRequest('/auth/logout','POST');setUser(null)},[]);
 const value=useMemo(()=>({user,loading,authError,signIn,signUp,signOut,refresh,complete}),[user,loading,authError,signIn,signUp,signOut,refresh,complete]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAuth(){const value=useContext(Context);if(!value)throw new Error('AuthProvider no configurado');return value;}
export function authRedirect(outcome:LoginOutcomeDTO){if(outcome.stage==='AUTHENTICATED')return outcome.user?.role==='ADMIN'?'/admin':'/account';if(outcome.stage==='VERIFY_EMAIL')return '/verify-email';return '/auth/continue'}
