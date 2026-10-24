import {Injectable,OnModuleDestroy,OnModuleInit} from '@nestjs/common';
import {createDatabase} from '@qapath/database';
@Injectable()
export class DatabaseProvider implements OnModuleDestroy,OnModuleInit {
 readonly connection;
 readonly db;
 constructor(){
  const url=process.env.DATABASE_URL;
  if(!url)throw new Error('DATABASE_URL obligatorio para activar identidad y progreso persistente. Consulte .env.example.');
  this.connection=createDatabase(url);this.db=this.connection.db;
 }
 async onModuleInit(){
  const result=await this.connection.pool.query("SELECT to_regclass('public.users') as users, to_regclass('public.student_progress') as student_progress, to_regclass('public.admin_audit_events') as admin_audit_events, to_regclass('public.student_progress_events') as student_progress_events");
  if(!result.rows[0]?.users||!result.rows[0]?.student_progress||!result.rows[0]?.admin_audit_events||!result.rows[0]?.student_progress_events)throw new Error('PostgreSQL conectado, pero faltan migraciones: ejecute pnpm db:migrate');
 }
 async onModuleDestroy(){await this.connection.pool.end();}
}
