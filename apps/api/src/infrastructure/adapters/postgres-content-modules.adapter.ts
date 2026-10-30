import {Inject,Injectable} from '@nestjs/common';
import {CatalogError} from '@qapath/learning';
import type {ContentModule,ModuleInput,ModuleRepositoryPort} from '@qapath/learning';
import {DatabaseProvider} from '../database.provider';
type Row=Record<string,unknown>;
type Connection={query:(sql:string,values?:unknown[])=>Promise<{rows:Row[];rowCount:number|null}>};
/** Módulo + si tiene contenido publicado, semanas del borrador (o publicado) y cursos que lo usan. */
const moduleSelect=`SELECT m.*,(o.published IS NOT NULL) is_published,
 COALESCE(jsonb_array_length(COALESCE(o.draft,o.published)->'weeks'),0) week_count,
 COALESCE((SELECT jsonb_agg(jsonb_build_object('id',c.id,'slug',c.slug,'title',c.title) ORDER BY c.title) FROM course_content r JOIN courses c ON c.id=r.course_id WHERE r.kind='MODULE' AND r.content_ref=m.id::text),'[]'::jsonb) courses
 FROM content_modules m LEFT JOIN module_outlines o ON o.module_id=m.id`;
const date=(value:unknown)=>value?new Date(value as string).toISOString():null;
const toModule=(row:Row):ContentModule=>({id:String(row.id),title:String(row.title),summary:String(row.summary),track:String(row.track),revision:Number(row.revision),updatedAt:date(row.updated_at)!,deletedAt:date(row.deleted_at),published:row.is_published===true,weeks:Number(row.week_count??0),courses:(row.courses as ContentModule['courses'])??[]});
@Injectable()
export class PostgresContentModulesAdapter implements ModuleRepositoryPort{
 constructor(@Inject(DatabaseProvider)private readonly database:DatabaseProvider){}
 private get pool(){return this.database.connection.pool}
 private async transaction<T>(work:(db:Connection)=>Promise<T>):Promise<T>{
  const client=await this.pool.connect();
  try{await client.query('BEGIN');const result=await work(client);await client.query('COMMIT');return result}
  catch(error){await client.query('ROLLBACK');throw error}
  finally{client.release()}
 }
 private async audit(db:Connection,actor:string,action:string,details:unknown){await db.query('INSERT INTO admin_audit_events(actor_user_id,action,details) VALUES($1,$2,$3::jsonb)',[actor,action,JSON.stringify(details)])}
 private async load(db:Connection,id:string){return toModule((await db.query(`${moduleSelect} WHERE m.id=$1`,[id])).rows[0])}
 private async locked(db:Connection,id:string,revision:number){
  const row=(await db.query('SELECT * FROM content_modules WHERE id=$1 FOR UPDATE',[id])).rows[0];
  if(!row)throw new CatalogError('NOT_FOUND','Módulo no disponible.');
  if(Number(row.revision)!==revision)throw new CatalogError('CONFLICT','El módulo cambió. Recarga antes de guardar.');
  return row;
 }
 async list(deleted:boolean){return (await this.pool.query(`${moduleSelect} WHERE m.deleted_at IS ${deleted?'NOT ':''}NULL ORDER BY m.updated_at DESC LIMIT 500`)).rows.map(toModule)}
 async get(id:string){const row=(await this.pool.query(`${moduleSelect} WHERE m.id=$1::uuid`,[id])).rows[0];return row?toModule(row):undefined}
 async create(actor:string,input:ModuleInput){return this.transaction(async db=>{
  if(Number((await db.query('SELECT count(*) total FROM content_modules WHERE deleted_at IS NULL')).rows[0].total)>=200)throw new CatalogError('LIMIT','Se admiten hasta 200 módulos activos.');
  const id=String((await db.query('INSERT INTO content_modules(title,summary,track) VALUES($1,$2,$3) RETURNING id',[input.title,input.summary,input.track])).rows[0].id);
  await this.audit(db,actor,'MODULE_CREATED',{moduleId:id,title:input.title});
  return this.load(db,id);
 })}
 async update(actor:string,id:string,revision:number,input:ModuleInput){return this.transaction(async db=>{
  const before=await this.locked(db,id,revision);
  if(before.deleted_at)throw new CatalogError('CONFLICT','Restaura el módulo antes de editarlo.');
  await db.query('UPDATE content_modules SET title=$2,summary=$3,track=$4,revision=revision+1,updated_at=now() WHERE id=$1',[id,input.title,input.summary,input.track]);
  await this.audit(db,actor,'MODULE_UPDATED',{moduleId:id,before:{title:before.title,summary:before.summary,track:before.track},after:input});
  return this.load(db,id);
 })}
 async remove(actor:string,id:string,revision:number){return this.transaction(async db=>{
  const before=await this.locked(db,id,revision);
  if(before.deleted_at)throw new CatalogError('CONFLICT','El módulo ya está eliminado.');
  // Se quita de los cursos; el contenido y el avance de los estudiantes se conservan.
  const unlinked=(await db.query("DELETE FROM course_content WHERE kind='MODULE' AND content_ref=$1 RETURNING course_id",[id])).rows.map(row=>String(row.course_id));
  if(unlinked.length)await db.query('UPDATE courses SET revision=revision+1,updated_at=now() WHERE id=ANY($1::uuid[])',[unlinked]);
  await db.query('UPDATE content_modules SET deleted_at=now(),revision=revision+1,updated_at=now() WHERE id=$1',[id]);
  await this.audit(db,actor,'MODULE_DELETED',{moduleId:id,title:before.title,unlinkedCourses:unlinked});
  return this.load(db,id);
 })}
 async restore(actor:string,id:string,revision:number){return this.transaction(async db=>{
  const before=await this.locked(db,id,revision);
  if(!before.deleted_at)throw new CatalogError('CONFLICT','Solo se restaura un módulo eliminado.');
  await db.query('UPDATE content_modules SET deleted_at=NULL,revision=revision+1,updated_at=now() WHERE id=$1',[id]);
  await this.audit(db,actor,'MODULE_RESTORED',{moduleId:id,title:before.title});
  return this.load(db,id);
 })}
}
