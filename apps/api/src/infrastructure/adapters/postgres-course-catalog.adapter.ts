import {Inject,Injectable} from '@nestjs/common';
import {CatalogError,courseTransition,validateCourse,normalizeCourseSearch} from '@qapath/learning';
import type {Course,CourseInput,CourseQuery,CourseStatus,CourseRepositoryPort,LearningPath,LearningPathRepositoryPort} from '@qapath/learning';
import {DatabaseProvider} from '../database.provider';
type Row=Record<string,unknown>;
type Connection={query:(sql:string,values?:unknown[])=>Promise<{rows:Row[];rowCount:number|null}>};
const courseSelect=`SELECT c.*,COALESCE((SELECT jsonb_agg(jsonb_build_object('kind',r.kind,'ref',r.content_ref) ORDER BY r.position) FROM course_content r WHERE r.course_id=c.id),'[]'::jsonb) assignments FROM courses c`;
function course(row:Row):Course{return {id:String(row.id),slug:String(row.slug),title:String(row.title),summary:String(row.summary),description:String(row.description),category:String(row.category),skills:row.skills as string[],cover:row.cover as string|null,position:Number(row.position),status:row.status as CourseStatus,contentKind:row.content_kind as Course['contentKind'],assignments:row.assignments as Course['assignments'],comingSoon:row.coming_soon===true,revision:Number(row.revision),createdAt:new Date(row.created_at as string).toISOString(),updatedAt:new Date(row.updated_at as string).toISOString()}}
const values=(input:CourseInput)=>[input.title.trim(),input.summary.trim(),input.description.trim(),input.category.trim(),JSON.stringify(input.skills),input.cover,input.position,input.contentKind];
@Injectable()
export class PostgresCourseCatalogAdapter implements CourseRepositoryPort{
 constructor(@Inject(DatabaseProvider)private readonly database:DatabaseProvider){}
 private get pool(){return this.database.connection.pool}
 private async transaction<T>(work:(db:Connection)=>Promise<T>):Promise<T>{
  const client=await this.pool.connect();
  try{await client.query('BEGIN');const result=await work(client);await client.query('COMMIT');return result}
  catch(error){await client.query('ROLLBACK');if((error as {code?:string}).code==='23505')throw new CatalogError('CONFLICT','El slug o la selección ya existen.');throw error}
  finally{client.release()}
 }
 async list(query:CourseQuery,admin:boolean){
  const where=[admin?'true':"c.catalog_managed AND c.status='PUBLISHED'"];
  const args:unknown[]=[];const add=(value:unknown)=>{args.push(value);return '$'+args.length};
  if(admin&&query.status)where.push(`c.status=${add(query.status)}`);
  if(query.category)where.push(`c.category=${add(query.category)}`);
  if(query.search){const pattern='%'+normalizeCourseSearch(query.search).replace(/[\\%_]/g,'\\$&')+'%';where.push(`translate(lower(concat_ws(' ',c.title,c.summary,c.description,c.category,c.skills::text)),'áéíóúüñ','aeiouun') LIKE ${add(pattern)}`)}
  const filter=where.join(' AND '),count=await this.pool.query(`SELECT count(*) total FROM courses c WHERE ${filter}`,args);
  const rows=await this.pool.query(`${courseSelect} WHERE ${filter} ORDER BY c.position,c.slug LIMIT $${args.length+1} OFFSET $${args.length+2}`,[...args,query.limit,(query.page-1)*query.limit]);
  return {items:rows.rows.map(course),total:Number(count.rows[0].total),page:query.page,limit:query.limit};
 }
 async get(key:string,admin:boolean){const result=await this.pool.query(`${courseSelect} WHERE ${admin?'c.id=$1::uuid':'c.slug=$1'} ${admin?'':"AND c.catalog_managed AND c.status='PUBLISHED'"}`,[key]);if(!result.rows[0])return undefined;const data=course(result.rows[0]);if(admin)data.usageCount=Number((await this.pool.query('SELECT count(*) total FROM learning_path_courses WHERE course_id=$1',[data.id])).rows[0].total);return data}
 private async assignments(db:Connection,id:string,input:CourseInput){
  // Las lecciones asignadas deben existir en la biblioteca y no estar eliminadas.
  const lessons=input.assignments.filter(ref=>ref.kind==='LESSON').map(ref=>ref.ref);
  if(lessons.length&&Number((await db.query('SELECT count(*) total FROM course_lessons WHERE id::text=ANY($1::text[]) AND deleted_at IS NULL',[lessons])).rows[0].total)!==lessons.length)throw new CatalogError('INVALID','Alguna lección asignada no existe o fue eliminada. Recarga el editor.');
  await db.query('DELETE FROM course_content WHERE course_id=$1',[id]);
  for(const [position,ref] of input.assignments.entries())await db.query('INSERT INTO course_content(course_id,kind,content_ref,position) VALUES($1,$2,$3,$4)',[id,ref.kind,ref.ref,position]);
 }
 private async audit(db:Connection,actor:string,id:string,action:string,before:unknown,after:unknown){await db.query('INSERT INTO admin_audit_events(actor_user_id,action,details) VALUES($1,$2,$3::jsonb)',[actor,action,JSON.stringify({courseId:id,before,after})])}
 async create(actor:string,input:CourseInput){return this.transaction(async db=>{
  const result=await db.query(`INSERT INTO courses(slug,title,summary,description,category,skills,cover,position,content_kind,coming_soon,status,published,catalog_managed) VALUES($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10,'DRAFT',false,true) RETURNING id`,[input.slug,...values(input),input.comingSoon===true]);
  const id=String(result.rows[0].id);await this.assignments(db,id,input);await this.audit(db,actor,id,'COURSE_CREATED',null,input);
  return course((await db.query(`${courseSelect} WHERE c.id=$1`,[id])).rows[0]);
 })}
 private async locked(db:Connection,id:string,revision:number){
  const row=(await db.query('SELECT * FROM courses WHERE id=$1 FOR UPDATE',[id])).rows[0];
  if(!row)throw new CatalogError('NOT_FOUND','Curso no disponible.');
  if(Number(row.revision)!==revision)throw new CatalogError('CONFLICT','El curso cambió. Recarga antes de guardar.');
  const assignments=(await db.query('SELECT kind,content_ref AS ref FROM course_content WHERE course_id=$1 ORDER BY position',[id])).rows;
  return course({...row,assignments});
 }
 async update(actor:string,id:string,revision:number,input:CourseInput,status:CourseStatus){return this.transaction(async db=>{
  const before=await this.locked(db,id,revision);courseTransition(before,status);
  if(before.slug!==input.slug)throw new CatalogError('CONFLICT','El slug es estable y no puede cambiarse.');
  const lessonRefs=input.assignments.filter(ref=>ref.kind==='LESSON').map(ref=>ref.ref);
  validateCourse(input,status,lessonRefs.length?Number((await db.query("SELECT count(*) total FROM course_lessons WHERE id::text=ANY($1::text[]) AND status='PUBLISHED' AND deleted_at IS NULL",[lessonRefs])).rows[0].total):0);
  await db.query('UPDATE courses SET title=$2,summary=$3,description=$4,category=$5,skills=$6::jsonb,cover=$7,position=$8,content_kind=$9,status=$10,published=$11,coming_soon=$12,catalog_managed=true,revision=revision+1,updated_at=now() WHERE id=$1',[id,...values(input),status,status==='PUBLISHED',input.comingSoon===true]);
  await this.assignments(db,id,input);await this.audit(db,actor,id,'COURSE_UPDATED',before,{...input,status});
  return course((await db.query(`${courseSelect} WHERE c.id=$1`,[id])).rows[0]);
 })}
 async transition(actor:string,id:string,revision:number,status:CourseStatus,restore:boolean){return this.transaction(async db=>{
  const before=await this.locked(db,id,revision);courseTransition(before,status,restore);
  await db.query('UPDATE courses SET status=$2,published=false,revision=revision+1,updated_at=now() WHERE id=$1',[id,status]);
  await this.audit(db,actor,id,restore?'COURSE_RESTORED':'COURSE_ARCHIVED',{status:before.status},{status});
  return course((await db.query(`${courseSelect} WHERE c.id=$1`,[id])).rows[0]);
 })}
 private async path(db:Connection,owner:string,id:string):Promise<LearningPath|undefined>{
  const row=(await db.query('SELECT * FROM learning_paths WHERE id=$1 AND user_id=$2',[id,owner])).rows[0];if(!row)return undefined;
  const courses=(await db.query('SELECT c.id,c.slug,c.title,c.status FROM learning_path_courses r JOIN courses c ON c.id=r.course_id WHERE r.path_id=$1 ORDER BY r.position',[id])).rows as LearningPath['courses'];
  return {id:String(row.id),title:String(row.title),active:row.active===true,revision:Number(row.revision),courses,createdAt:new Date(row.created_at as string).toISOString(),updatedAt:new Date(row.updated_at as string).toISOString()};
 }
 async listPaths(owner:string){const rows=await this.pool.query('SELECT id FROM learning_paths WHERE user_id=$1 ORDER BY active DESC,created_at,id',[owner]);const paths:LearningPath[]=[];for(const row of rows.rows){const path=await this.path(this.pool,owner,String(row.id));if(path)paths.push(path)}return paths}
 async getPath(owner:string,id:string){return this.path(this.pool,owner,id)}
 async savePath(owner:string,id:string|undefined,input:{title:string;courseIds:string[];active:boolean;revision?:number},maximum:number){return this.transaction(async db=>{
  await db.query('SELECT id FROM users WHERE id=$1 FOR UPDATE',[owner]);
  const before=id?await this.path(db,owner,id):undefined;
  if(id&&!before)throw new CatalogError('NOT_FOUND','Ruta no disponible.');
  if(before&&before.revision!==input.revision)throw new CatalogError('CONFLICT','La ruta cambió. Recarga antes de guardar.');
  if(!id&&Number((await db.query('SELECT count(*) total FROM learning_paths WHERE user_id=$1',[owner])).rows[0].total)>=maximum)throw new CatalogError('LIMIT','Alcanzaste el límite de rutas.');
  const selected=(await db.query('SELECT id,status,catalog_managed FROM courses WHERE id=ANY($1::uuid[]) FOR SHARE',[input.courseIds])).rows;
  if(selected.length!==input.courseIds.length||selected.some(c=>(c.status!=='PUBLISHED'||!c.catalog_managed)&&!before?.courses.some(previous=>previous.id===c.id)))throw new CatalogError('INVALID','Solo puedes añadir cursos publicados. Los anteriores no disponibles pueden conservarse o retirarse.');
  if(input.active)await db.query('UPDATE learning_paths SET active=false,revision=revision+1,updated_at=now() WHERE user_id=$1 AND active AND ($2::uuid IS NULL OR id<>$2)',[owner,id||null]);
  if(id)await db.query('UPDATE learning_paths SET title=$3,active=$4,revision=revision+1,updated_at=now() WHERE id=$1 AND user_id=$2',[id,owner,input.title.trim(),input.active]);
  else id=String((await db.query('INSERT INTO learning_paths(user_id,title,active) VALUES($1,$2,$3) RETURNING id',[owner,input.title.trim(),input.active])).rows[0].id);
  await db.query('DELETE FROM learning_path_courses WHERE path_id=$1',[id]);
  for(const [position,courseId] of input.courseIds.entries())await db.query('INSERT INTO learning_path_courses(path_id,course_id,position) VALUES($1,$2,$3)',[id,courseId,position]);
  return (await this.path(db,owner,id))!;
 })}
 async removePath(owner:string,id:string,revision:number){return this.transaction(async db=>{
  await db.query('SELECT id FROM users WHERE id=$1 FOR UPDATE',[owner]);
  const before=await this.path(db,owner,id);if(!before)throw new CatalogError('NOT_FOUND','Ruta no disponible.');
  if(before.revision!==revision)throw new CatalogError('CONFLICT','La ruta cambió. Recarga antes de eliminar.');
  await db.query('DELETE FROM learning_path_courses WHERE path_id=$1',[id]);await db.query('DELETE FROM learning_paths WHERE id=$1 AND user_id=$2',[id,owner]);
 })}
}
/** Separate port adapter keeps learning-path ownership explicit at the application boundary. */
export class PersonalLearningPaths implements LearningPathRepositoryPort{
 constructor(private readonly repository:PostgresCourseCatalogAdapter){}
 list(owner:string){return this.repository.listPaths(owner)}
 get(owner:string,id:string){return this.repository.getPath(owner,id)}
 save(owner:string,id:string|undefined,input:{title:string;courseIds:string[];active:boolean;revision?:number},maximum:number){return this.repository.savePath(owner,id,input,maximum)}
 remove(owner:string,id:string,revision:number){return this.repository.removePath(owner,id,revision)}
}
