import {Inject,Injectable} from '@nestjs/common';
import {CatalogError,isExistingFile} from '@qapath/learning';
import type {Lesson,LessonInput,LessonRepositoryPort,LessonStatus,LessonSummary,NewStudyFile,StudyFile,StudyFileKind,LESSON_LIMITS} from '@qapath/learning';
import {DatabaseProvider} from '../database.provider';
type Row=Record<string,unknown>;
type Connection={query:(sql:string,values?:unknown[])=>Promise<{rows:Row[];rowCount:number|null}>};
type Limits=typeof LESSON_LIMITS;
/** Resumen + cursos que usan la lección (contenido asignado kind LESSON). */
const summarySelect=`SELECT l.*,
 (SELECT count(*) FROM course_lesson_files f WHERE f.lesson_id=l.id AND f.retired_at IS NULL) file_count,
 COALESCE((SELECT jsonb_agg(DISTINCT f.kind) FROM course_lesson_files f WHERE f.lesson_id=l.id AND f.retired_at IS NULL),'[]'::jsonb) kinds,
 COALESCE((SELECT jsonb_agg(jsonb_build_object('id',c.id,'slug',c.slug,'title',c.title,'status',c.status) ORDER BY c.title) FROM course_content r JOIN courses c ON c.id=r.course_id WHERE r.kind='LESSON' AND r.content_ref=l.id::text),'[]'::jsonb) courses
 FROM course_lessons l`;
/** Curso visible para estudiantes: publicado, gestionado por catálogo y no «En construcción». */
const publicCourse="c.slug=$1 AND c.catalog_managed AND c.status='PUBLISHED' AND NOT c.coming_soon";
const date=(value:unknown)=>value?new Date(value as string).toISOString():null;
function summary(row:Row):LessonSummary{return {id:String(row.id),title:String(row.title),summary:String(row.summary),status:row.status as LessonStatus,revision:Number(row.revision),fileCount:Number(row.file_count??0),kinds:(row.kinds as StudyFileKind[])??[],updatedAt:date(row.updated_at)!,deletedAt:date(row.deleted_at),courses:(row.courses as LessonSummary['courses'])??[]}}
const file=(row:Row):StudyFile=>({id:String(row.id),kind:row.kind as StudyFileKind,filename:String(row.filename),content:String(row.content),size:Number(row.size),position:Number(row.position)});
const bytes=(text:string)=>Buffer.byteLength(text,'utf8');
@Injectable()
export class PostgresCourseLessonsAdapter implements LessonRepositoryPort{
 constructor(@Inject(DatabaseProvider)private readonly database:DatabaseProvider){}
 private get pool(){return this.database.connection.pool}
 private async transaction<T>(work:(db:Connection)=>Promise<T>):Promise<T>{
  const client=await this.pool.connect();
  try{await client.query('BEGIN');const result=await work(client);await client.query('COMMIT');return result}
  catch(error){await client.query('ROLLBACK');throw error}
  finally{client.release()}
 }
 private async audit(db:Connection,actor:string,action:string,details:unknown){await db.query('INSERT INTO admin_audit_events(actor_user_id,action,details) VALUES($1,$2,$3::jsonb)',[actor,action,JSON.stringify(details)])}
 private async files(db:Connection,lessonId:string){return (await db.query('SELECT * FROM course_lesson_files WHERE lesson_id=$1 AND retired_at IS NULL ORDER BY position,created_at',[lessonId])).rows.map(file)}
 private async load(db:Connection,lessonId:string):Promise<Lesson>{const row=(await db.query(`${summarySelect} WHERE l.id=$1`,[lessonId])).rows[0];return {...summary(row),files:await this.files(db,lessonId)}}
 private async locked(db:Connection,id:string,revision:number){
  const row=(await db.query('SELECT * FROM course_lessons WHERE id=$1 FOR UPDATE',[id])).rows[0];
  if(!row)throw new CatalogError('NOT_FOUND','Lección no disponible.');
  if(Number(row.revision)!==revision)throw new CatalogError('CONFLICT','La lección cambió. Recarga antes de guardar.');
  return row;
 }
 private async insertFile(db:Connection,actor:string,lessonId:string,item:NewStudyFile,position:number){
  await db.query('INSERT INTO course_lesson_files(lesson_id,kind,filename,content,size,position,created_by) VALUES($1,$2,$3,$4,$5,$6,$7)',[lessonId,item.kind,item.filename,item.content,bytes(item.content),position,actor]);
 }
 async library(query:{search:string;deleted:boolean}){
  const args:unknown[]=[];let where=query.deleted?'l.deleted_at IS NOT NULL':'l.deleted_at IS NULL';
  if(query.search){args.push('%'+query.search.toLowerCase().replace(/[\\%_]/g,'\\$&')+'%');where+=` AND lower(l.title||' '||l.summary) LIKE $1`}
  return (await this.pool.query(`${summarySelect} WHERE ${where} ORDER BY l.updated_at DESC LIMIT 500`,args)).rows.map(summary);
 }
 async get(id:string){const row=(await this.pool.query(`${summarySelect} WHERE l.id=$1::uuid`,[id])).rows[0];return row?{...summary(row),files:await this.files(this.pool,String(row.id))}:undefined}
 async forCourse(slug:string){
  return (await this.pool.query(`${summarySelect} JOIN course_content r ON r.kind='LESSON' AND r.content_ref=l.id::text JOIN courses c ON c.id=r.course_id
   WHERE ${publicCourse} AND l.status='PUBLISHED' AND l.deleted_at IS NULL ORDER BY r.position`,[slug])).rows.map(summary);
 }
 async getForCourse(slug:string,id:string){
  const row=(await this.pool.query(`${summarySelect} JOIN course_content r ON r.kind='LESSON' AND r.content_ref=l.id::text JOIN courses c ON c.id=r.course_id
   WHERE ${publicCourse} AND l.id=$2::uuid AND l.status='PUBLISHED' AND l.deleted_at IS NULL`,[slug,id])).rows[0];
  return row?{...summary(row),files:await this.files(this.pool,String(row.id))}:undefined;
 }
 async create(actor:string,input:LessonInput,limits:Limits){return this.transaction(async db=>{
  const count=Number((await db.query('SELECT count(*) total FROM course_lessons WHERE deleted_at IS NULL')).rows[0].total);
  if(count>=limits.lessons)throw new CatalogError('LIMIT',`La biblioteca admite hasta ${limits.lessons} lecciones activas.`);
  const id=String((await db.query('INSERT INTO course_lessons(title,summary,status) VALUES($1,$2,$3) RETURNING id',[input.title,input.summary,input.status])).rows[0].id);
  for(const [position,ref] of input.files.entries())if(!isExistingFile(ref))await this.insertFile(db,actor,id,ref,position);
  await this.audit(db,actor,'LESSON_CREATED',{lessonId:id,title:input.title,status:input.status,files:input.files.map(f=>'filename' in f?f.filename:f.id)});
  return this.load(db,id);
 })}
 async update(actor:string,id:string,revision:number,input:LessonInput,limits:Limits){return this.transaction(async db=>{
  const before=await this.locked(db,id,revision);
  if(before.deleted_at)throw new CatalogError('CONFLICT','Restaura la lección antes de editarla.');
  const current=await this.files(db,id),known=new Set(current.map(f=>f.id));
  const keep=new Set(input.files.filter(isExistingFile).map(ref=>ref.id)),added=input.files.filter((ref):ref is NewStudyFile=>!isExistingFile(ref));
  if([...keep].some(fileId=>!known.has(fileId)))throw new CatalogError('INVALID','El orden incluye archivos que no pertenecen a la lección.');
  if(input.files.length>limits.files)throw new CatalogError('LIMIT',`Una lección admite hasta ${limits.files} archivos.`);
  const retired=current.filter(f=>!keep.has(f.id));
  if(retired.length)await db.query('UPDATE course_lesson_files SET retired_at=now() WHERE id=ANY($1::uuid[])',[retired.map(f=>f.id)]);
  for(const [position,ref] of input.files.entries()){if(isExistingFile(ref))await db.query('UPDATE course_lesson_files SET position=$2 WHERE id=$1',[ref.id,position]);else await this.insertFile(db,actor,id,ref,position)}
  await db.query('UPDATE course_lessons SET title=$2,summary=$3,status=$4,revision=revision+1,updated_at=now() WHERE id=$1',[id,input.title,input.summary,input.status]);
  await this.audit(db,actor,'LESSON_UPDATED',{lessonId:id,before:{title:before.title,status:before.status},after:{title:input.title,status:input.status},added:added.map(f=>f.filename),retired:retired.map(f=>f.filename)});
  return this.load(db,id);
 })}
 async remove(actor:string,id:string,revision:number){return this.transaction(async db=>{
  const before=await this.locked(db,id,revision);
  if(before.deleted_at)throw new CatalogError('CONFLICT','La lección ya está eliminada.');
  // Se quita de los cursos (contenido asignado); queda registro en auditoría para saber de dónde se quitó.
  const unlinked=(await db.query("DELETE FROM course_content WHERE kind='LESSON' AND content_ref=$1 RETURNING course_id",[id])).rows.map(row=>String(row.course_id));
  if(unlinked.length)await db.query('UPDATE courses SET revision=revision+1,updated_at=now() WHERE id=ANY($1::uuid[])',[unlinked]);
  await db.query('UPDATE course_lessons SET deleted_at=now(),status=$2,revision=revision+1,updated_at=now() WHERE id=$1',[id,'DRAFT']);
  await this.audit(db,actor,'LESSON_DELETED',{lessonId:id,title:before.title,unlinkedCourses:unlinked});
  return this.load(db,id);
 })}
 async restore(actor:string,id:string,revision:number){return this.transaction(async db=>{
  const before=await this.locked(db,id,revision);
  if(!before.deleted_at)throw new CatalogError('CONFLICT','Solo se restaura una lección eliminada.');
  await db.query('UPDATE course_lessons SET deleted_at=NULL,revision=revision+1,updated_at=now() WHERE id=$1',[id]);
  await this.audit(db,actor,'LESSON_RESTORED',{lessonId:id,title:before.title});
  return this.load(db,id);
 })}
}
