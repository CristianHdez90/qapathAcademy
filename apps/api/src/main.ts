import 'reflect-metadata';
import {NestFactory} from '@nestjs/core';
import type {NestExpressApplication} from '@nestjs/platform-express';
import {AppModule} from './app.module';
import {existsSync} from 'node:fs';
import {readFirebaseMailConfig} from './infrastructure/adapters/firebase-email.adapter';
import {readFirebaseAuthConfig} from './infrastructure/adapters/firebase-auth.adapter';
if(existsSync('.env'))process.loadEnvFile('.env');
async function bootstrap(){
 if(process.env.AUTH_PROVIDER&&!['local','firebase'].includes(process.env.AUTH_PROVIDER))throw new Error('AUTH_PROVIDER debe ser local o firebase.');
 if(process.env.AUTH_PROVIDER==='firebase')readFirebaseAuthConfig();
 if(process.env.NODE_ENV==='production'){
  if(!/^https:\/\//.test(process.env.APP_URL||''))throw new Error('APP_URL HTTPS es obligatorio en producción.');
  if(!/^[A-Fa-f0-9]{64}$/.test(process.env.MFA_ENCRYPTION_KEY||''))throw new Error('MFA_ENCRYPTION_KEY válido es obligatorio en producción.');
  const transport=(process.env.EMAIL_TRANSPORT||'resend').toLowerCase();
  if(process.env.AUTH_PROVIDER==='firebase'){/* Authentication sends its own verification emails. */}
  else if(transport==='firebase')readFirebaseMailConfig();
  else if(transport==='resend'){if(!process.env.RESEND_API_KEY||!process.env.EMAIL_FROM)throw new Error('Resend: configura RESEND_API_KEY y EMAIL_FROM.')}
  else throw new Error('EMAIL_TRANSPORT no permitido en producción.');
 }
 const allowed=(process.env.WEB_ORIGIN||'http://localhost:3000,http://127.0.0.1:3000').split(',').map(v=>v.trim());
 const app=await NestFactory.create<NestExpressApplication>(AppModule,{cors:{origin:allowed,credentials:true}});
 // SPEC-CONTENT-320: las lecciones suben archivos de texto (hasta 300 KB c/u). El resto de endpoints valida tamaños con zod.
 app.useBodyParser('json',{limit:process.env.API_JSON_LIMIT||'2mb'});
 app.setGlobalPrefix('api/v1');
 app.use((_req:unknown,res:{setHeader:(name:string,value:string)=>void},next:()=>void)=>{res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');next();});
 app.enableShutdownHooks();
 await app.listen(Number(process.env.PORT)||4000,'0.0.0.0');
 console.info(`QAPath API disponible en ${await app.getUrl()}/api/v1/health`);
}
void bootstrap();
