import {Inject,Injectable} from '@nestjs/common';
import {CatalogError,isExistingFile} from '@qapath/learning';
import type {LessonFileRef,Lesson,LessonRepositoryPort,LessonStatus,LessonSummary,NewStudyFile,StudyFile,StudyFileKind,LESSON_LIMITS} from '@qapath/learning';
import {DatabaseProvider} from '../database.provider';
type Row=Record<string,unknown>;
type Connection={query:(sql:string,values?:unknown[])=>Promise<{rows:Row[];rowCount:number|null}>};
type Limits=typeof LESSON_LIMITS;
const summarySelect=`SELECT l.*,
 (SELECT count(*) FROM course_lesson_files f WHERE f.lesson_id=l.id AND f.retired_at IS NULL) file_count,
 COALESCE((SELECT jsonb_agg(DISTINCT f.kind) FROM course_lesson_files f WHERE f.lesson_id=l.id AND f.retired_at IS NULL),'[]'::jsonb) kinds
 FROM course_lessons l`;
/** Curso visible para estudiantes: publicado, gestionado por catálogo y no «En construcción». */
const publicCourse="c.slug=$1 AND c.catalog_managed AND c.status='PUBLISHED' AND NOT c.coming_soon";
function summary(row:Row):LessonSummary{return {id:String(row.id),courseId:String(row.course_id),position:Number(row.position),title:String(row.title),summary:String(row.summary),status:row.status as LessonStatus,revision:Number(row.revision),fileCount:Number(row.file_count??0),kinds:(row.kinds as StudyFileKind[])??[],updatedAt:new Date(row.updated_at as string).toISOString()}}
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
 private async course(db:Connection,courseId:string){const row=(await db.query('SELECT id,status FROM courses WHERE id=$1 FOR UPDATE',[courseId])).rows[0];if(!row)throw new CatalogError('NOT_FOUND','Curso no disponible.');if(row.status==='ARCHIVED')throw new CatalogError('CONFLICT','Restaura el curso antes de cambiar su contenido de estudio.');}
 private async locked(db:Connection,courseId:string,lessonId:string,revision:number){
  const row=(await db.query('SELECT * FROM course_lessons WHERE id=$1 AND course_id=$2 FOR UPDATE',[lessonId,courseId])).rows[0];
  if(!row)throw new CatalogError('NOT_FOUND','Lección no disponible.');
  if(Number(row.revision)!==revision)throw new CatalogError('CONFLICT','La lección cambió. Recarga antes de guardar.');
  return row;
 }
 private async insertFiles(db:Connection,actor:string,lessonId:string,files:NewStudyFile[],start:number){
  for(const [index,item] of files.entries())await db.query('INSERT INTO course_lesson_files(lesson_id,kind,filename,content,size,position,created_by) VALUES($1,$2,$3,$4,$5,$6,$7)',[lessonId,item.kind,item.filename,item.content,bytes(item.content),start+index,actor]);
 }
 async list(courseKey:string,admin:boolean){
  const rows=admin
   ?await this.pool.query(`${summarySelect} WHERE l.course_id=$1::uuid ORDER BY l.status='ARCHIVED',l.position,l.created_at`,[courseKey])
   :await this.pool.query(`${summarySelect} JOIN courses c ON c.id=l.course_id WHERE ${publicCourse} AND l.status='PUBLISHED' ORDER BY l.position,l.created_at`,[courseKey]);
  return rows.rows.map(summary);
 }
 async get(courseKey:string,lessonId:string,admin:boolean){
  const row=admin
   ?(await this.pool.query(`${summarySelect} WHERE l.course_id=$1::uuid AND l.id=$2::uuid`,[courseKey,lessonId])).rows[0]
   :(await this.pool.query(`${summarySelect} JOIN courses c ON c.id=l.course_id WHERE ${publicCourse} AND l.id=$2::uuid AND l.status='PUBLISHED'`,[courseKey,lessonId])).rows[0];
  if(!row)return undefined;
  return {...summary(row),files:await this.files(this.pool,String(row.id))};
 }
 async create(actor:string,courseId:string,input:{title:string;summary:string;files:NewStudyFile[]},limits:Limits){return this.transaction(async db=>{
  await this.course(db,courseId);
  const count=Number((await db.query("SELECT count(*) total FROM course_lessons WHERE course_id=$1 AND status<>'ARCHIVED'",[courseId])).rows[0].total);
  if(count>=limits.lessons)throw new CatalogError('LIMIT',`El curso admite hasta ${limits.lessons} lecciones activas.`);
  const position=Number((await db.query('SELECT COALESCE(max(position)+1,0) next FROM course_lessons WHERE course_id=$1',[courseId])).rows[0].next);
  const id=String((await db.query('INSERT INTO course_lessons(course_id,position,title,summary) VALUES($1,$2,$3,$4) RETURNING id',[courseId,position,input.title,input.summary])).rows[0].id);
  await this.insertFiles(db,actor,id,input.files,0);
  await this.audit(db,actor,'LESSON_CREATED',{courseId,lessonId:id,title:input.title,files:input.files.map(f=>f.filename)});
  return this.load(db,id);
 })}
 async update(actor:string,courseId:string,lessonId:string,input:{revision:number;title:string;summary:string;status:'DRAFT'|'PUBLISHED';files:LessonFileRef[]},limits:Limits){return this.transaction(async db=>{
  await this.course(db,courseId);
  const before=await this.locked(db,courseId,lessonId,input.revision);
  if(before.status==='ARCHIVED')throw new CatalogError('CONFLICT','Restaura la lección antes de editarla.');
  const current=await this.files(db,lessonId),known=new Set(current.map(f=>f.id));
  const keep=new Set(input.files.filter(isExistingFile).map(ref=>ref.id)),added=input.files.filter((ref):ref is NewStudyFile=>!isExistingFile(ref));
  if([...keep].some(id=>!known.has(id)))throw new CatalogError('INVALID','El orden incluye archivos que no pertenecen a la lección.');
  if(input.files.length>limits.files)throw new CatalogError('LIMIT',`Una lección admite hasta ${limits.files} archivos.`);
  const retired=current.filter(f=>!keep.has(f.id));
  if(retired.length)await db.query('UPDATE course_lesson_files SET retired_at=now() WHERE id=ANY($1::uuid[])',[retired.map(f=>f.id)]);
  for(const [position,ref] of input.files.entries()){if(isExistingFile(ref))await db.query('UPDATE course_lesson_files SET position=$2 WHERE id=$1',[ref.id,position]);else await this.insertFiles(db,actor,lessonId,[ref],position)}
  await db.query('UPDATE course_lessons SET title=$2,summary=$3,status=$4,revision=revision+1,updated_at=now() WHERE id=$1',[lessonId,input.title,input.summary,input.status]);
  await this.audit(db,actor,'LESSON_UPDATED',{courseId,lessonId,before:{title:before.title,status:before.status},after:{title:input.title,status:input.status},added:added.map(f=>f.filename),retired:retired.map(f=>f.filename)});
  return this.load(db,lessonId);
 })}
 async archive(actor:string,courseId:string,lessonId:string,revision:number,restore:boolean){return this.transaction(async db=>{
  await this.course(db,courseId);
  const before=await this.locked(db,courseId,lessonId,revision);
  if(restore!==(before.status==='ARCHIVED'))throw new CatalogError('CONFLICT',restore?'Solo se restaura una lección archivada.':'La lección ya está archivada.');
  await db.query('UPDATE course_lessons SET status=$2,revision=revision+1,updated_at=now() WHERE id=$1',[lessonId,restore?'DRAFT':'ARCHIVED']);
  await this.audit(db,actor,restore?'LESSON_RESTORED':'LESSON_ARCHIVED',{courseId,lessonId,title:before.title});
  return this.load(db,lessonId);
 })}
 async reorder(actor:string,courseId:string,order:{id:string;revision:number}[]){return this.transaction(async db=>{
  await this.course(db,courseId);
  for(const item of order)await this.locked(db,courseId,item.id,item.revision);
  for(const [position,item] of order.entries())await db.query('UPDATE course_lessons SET position=$2,revision=revision+1,updated_at=now() WHERE id=$1',[item.id,position]);
  await this.audit(db,actor,'LESSONS_REORDERED',{courseId,order:order.map(item=>item.id)});
  return (await db.query(`${summarySelect} WHERE l.course_id=$1 ORDER BY l.status='ARCHIVED',l.position,l.created_at`,[courseId])).rows.map(summary);
 })}
}
