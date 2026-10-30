import {Inject,Injectable} from '@nestjs/common';
import {CatalogError} from '@qapath/learning';
import type {CourseOutline,OutlineProgress,OutlineRepositoryPort,OutlineState} from '@qapath/learning';
import {DatabaseProvider} from '../database.provider';
type Row=Record<string,unknown>;
const visible="c.catalog_managed AND c.status='PUBLISHED' AND NOT c.coming_soon";
const progress=(row?:Row):OutlineProgress=>({readCards:(row?.read_cards as string[])??[],passedChapters:(row?.passed_chapters as Record<string,number>)??{}});
@Injectable()
export class PostgresCourseOutlineAdapter implements OutlineRepositoryPort{
 constructor(@Inject(DatabaseProvider)private readonly database:DatabaseProvider){}
 private get pool(){return this.database.connection.pool}
 private async audit(actor:string,action:string,details:unknown){await this.pool.query('INSERT INTO admin_audit_events(actor_user_id,action,details) VALUES($1,$2,$3::jsonb)',[actor,action,JSON.stringify(details)])}
 async load(courseId:string):Promise<OutlineState|undefined>{
  const row=(await this.pool.query('SELECT c.id,o.* FROM courses c LEFT JOIN course_outlines o ON o.course_id=c.id WHERE c.id=$1::uuid',[courseId])).rows[0];
  if(!row)return undefined;
  return {courseId,draft:(row.draft as CourseOutline)??null,draftRevision:Number(row.draft_revision??0),draftUpdatedAt:row.draft_updated_at?new Date(row.draft_updated_at as string):null,published:(row.published as CourseOutline)??null,publishedRevision:Number(row.published_revision??0),publishedAt:row.published_at?new Date(row.published_at as string):null};
 }
 async saveDraft(actor:string,courseId:string,expectedRevision:number,outline:CourseOutline,action:string){
  await this.pool.query('INSERT INTO course_outlines(course_id) VALUES($1) ON CONFLICT (course_id) DO NOTHING',[courseId]);
  const result=await this.pool.query('UPDATE course_outlines SET draft=$2::jsonb,draft_revision=draft_revision+1,draft_updated_at=now(),draft_updated_by=$3 WHERE course_id=$1 AND draft_revision=$4 RETURNING draft_revision',[courseId,JSON.stringify(outline),actor,expectedRevision]);
  if(!result.rowCount)throw new CatalogError('CONFLICT','El contenido cambió en otra pestaña o sesión. Recarga antes de guardar.');
  const stats=outline.weeks.reduce((s,w)=>({weeks:s.weeks+1,chapters:s.chapters+w.chapters.length,cards:s.cards+w.chapters.reduce((n,c)=>n+c.cards.length,0)}),{weeks:0,chapters:0,cards:0});
  await this.audit(actor,action,{courseId,revision:Number(result.rows[0].draft_revision),...stats});
  return Number(result.rows[0].draft_revision);
 }
 async publish(actor:string,courseId:string,expectedRevision:number){
  const result=await this.pool.query('UPDATE course_outlines SET published=draft,published_revision=published_revision+1,published_at=now() WHERE course_id=$1 AND draft_revision=$2 AND draft IS NOT NULL RETURNING published_revision',[courseId,expectedRevision]);
  if(!result.rowCount)throw new CatalogError('CONFLICT','Guarda el borrador (o recarga) antes de publicar.');
  await this.audit(actor,'OUTLINE_PUBLISHED',{courseId,draftRevision:expectedRevision,publishedRevision:Number(result.rows[0].published_revision)});
 }
 async unpublish(actor:string,courseId:string){
  // El borrador conserva lo que estaba publicado: nada se pierde.
  await this.pool.query('UPDATE course_outlines SET draft=COALESCE(draft,published),published=NULL,published_at=NULL WHERE course_id=$1',[courseId]);
  await this.audit(actor,'OUTLINE_UNPUBLISHED',{courseId});
 }
 async published(slug:string){
  const row=(await this.pool.query(`SELECT c.id,c.slug,c.title,o.published,o.published_revision FROM courses c JOIN course_outlines o ON o.course_id=c.id WHERE c.slug=$1 AND ${visible} AND o.published IS NOT NULL`,[slug])).rows[0];
  return row?{courseId:String(row.id),slug:String(row.slug),title:String(row.title),revision:Number(row.published_revision),outline:row.published as CourseOutline}:undefined;
 }
 async progress(userId:string,courseId:string){return progress((await this.pool.query('SELECT * FROM course_outline_progress WHERE user_id=$1 AND course_id=$2',[userId,courseId])).rows[0])}
 async markRead(userId:string,courseId:string,cardIds:string[]){
  const row=(await this.pool.query(`INSERT INTO course_outline_progress(user_id,course_id,read_cards) VALUES($1,$2,$3::jsonb)
   ON CONFLICT (user_id,course_id) DO UPDATE SET read_cards=(SELECT COALESCE(jsonb_agg(DISTINCT value),'[]'::jsonb) FROM jsonb_array_elements_text(course_outline_progress.read_cards||EXCLUDED.read_cards)),updated_at=now() RETURNING *`,[userId,courseId,JSON.stringify(cardIds)])).rows[0];
  return progress(row);
 }
 async recordQuiz(userId:string,courseId:string,chapterId:string,percent:number){
  // Se guarda la mejor nota del capítulo; un intento peor nunca baja lo aprobado.
  const row=(await this.pool.query(`INSERT INTO course_outline_progress(user_id,course_id,passed_chapters) VALUES($1,$2,jsonb_build_object($3::text,$4::int))
   ON CONFLICT (user_id,course_id) DO UPDATE SET passed_chapters=course_outline_progress.passed_chapters||jsonb_build_object($3::text,GREATEST($4::int,COALESCE((course_outline_progress.passed_chapters->>$3)::int,0))),updated_at=now() RETURNING *`,[userId,courseId,chapterId,percent])).rows[0];
  return progress(row);
 }
}
