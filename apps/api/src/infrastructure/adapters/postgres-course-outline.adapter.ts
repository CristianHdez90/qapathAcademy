import {Inject,Injectable} from '@nestjs/common';
import {CatalogError} from '@qapath/learning';
import type {CourseOutline,OutlineOwner,OutlineProgress,OutlineRepositoryPort,OutlineState} from '@qapath/learning';
import {DatabaseProvider} from '../database.provider';
type Row=Record<string,unknown>;
const visible="c.catalog_managed AND c.status='PUBLISHED' AND NOT c.coming_soon";
const progress=(row?:Row):OutlineProgress=>({readCards:(row?.read_cards as string[])??[],passedChapters:(row?.passed_chapters as Record<string,number>)??{}});
/** Tabla de contenido según el dueño: curso (course_outlines) o módulo propio (module_outlines). */
const TABLES={
 course:{table:'course_outlines',key:'course_id',owner:'SELECT c.id,c.title FROM courses c WHERE c.id=$1::uuid'},
 module:{table:'module_outlines',key:'module_id',owner:'SELECT m.id,m.title FROM content_modules m WHERE m.id=$1::uuid AND m.deleted_at IS NULL'},
} as const;
/**
 * Los identificadores de un módulo se prefijan al combinarlo con el curso (m + 6 hex + _):
 * así dos módulos (o un módulo y el curso) pueden reutilizar los mismos ids sin chocar en el avance.
 */
export const modulePrefix=(moduleId:string)=>`m${moduleId.replace(/-/g,'').slice(0,6)}_`;
function prefixed(outline:CourseOutline,prefix:string):CourseOutline{
 return {weeks:outline.weeks.map(w=>({...w,id:prefix+w.id,chapters:w.chapters.map(c=>({...c,id:prefix+c.id,cards:c.cards.map(card=>({...card,id:prefix+card.id}))}))}))};
}
@Injectable()
export class PostgresCourseOutlineAdapter implements OutlineRepositoryPort{
 constructor(@Inject(DatabaseProvider)private readonly database:DatabaseProvider){}
 private get pool(){return this.database.connection.pool}
 private async audit(actor:string,action:string,details:unknown){await this.pool.query('INSERT INTO admin_audit_events(actor_user_id,action,details) VALUES($1,$2,$3::jsonb)',[actor,action,JSON.stringify(details)])}
 private detail(owner:OutlineOwner){return owner.kind==='module'?{moduleId:owner.id}:{courseId:owner.id}}
 async load(owner:OutlineOwner):Promise<OutlineState|undefined>{
  const t=TABLES[owner.kind];
  const base=(await this.pool.query(t.owner,[owner.id])).rows[0];
  if(!base)return undefined;
  const row=(await this.pool.query(`SELECT * FROM ${t.table} WHERE ${t.key}=$1`,[owner.id])).rows[0]??{};
  return {courseId:owner.id,title:String(base.title),draft:(row.draft as CourseOutline)??null,draftRevision:Number(row.draft_revision??0),draftUpdatedAt:row.draft_updated_at?new Date(row.draft_updated_at as string):null,published:(row.published as CourseOutline)??null,publishedRevision:Number(row.published_revision??0),publishedAt:row.published_at?new Date(row.published_at as string):null};
 }
 async saveDraft(actor:string,owner:OutlineOwner,expectedRevision:number,outline:CourseOutline,action:string){
  const t=TABLES[owner.kind];
  await this.pool.query(`INSERT INTO ${t.table}(${t.key}) VALUES($1) ON CONFLICT (${t.key}) DO NOTHING`,[owner.id]);
  const result=await this.pool.query(`UPDATE ${t.table} SET draft=$2::jsonb,draft_revision=draft_revision+1,draft_updated_at=now(),draft_updated_by=$3 WHERE ${t.key}=$1 AND draft_revision=$4 RETURNING draft_revision`,[owner.id,JSON.stringify(outline),actor,expectedRevision]);
  if(!result.rowCount)throw new CatalogError('CONFLICT','El contenido cambió en otra pestaña o sesión. Recarga antes de guardar.');
  const stats=outline.weeks.reduce((s,w)=>({weeks:s.weeks+1,chapters:s.chapters+w.chapters.length,cards:s.cards+w.chapters.reduce((n,c)=>n+c.cards.length,0)}),{weeks:0,chapters:0,cards:0});
  await this.audit(actor,action,{...this.detail(owner),revision:Number(result.rows[0].draft_revision),...stats});
  return Number(result.rows[0].draft_revision);
 }
 async publish(actor:string,owner:OutlineOwner,expectedRevision:number){
  const t=TABLES[owner.kind];
  const result=await this.pool.query(`UPDATE ${t.table} SET published=draft,published_revision=published_revision+1,published_at=now() WHERE ${t.key}=$1 AND draft_revision=$2 AND draft IS NOT NULL RETURNING published_revision`,[owner.id,expectedRevision]);
  if(!result.rowCount)throw new CatalogError('CONFLICT','Guarda el borrador (o recarga) antes de publicar.');
  await this.audit(actor,'OUTLINE_PUBLISHED',{...this.detail(owner),draftRevision:expectedRevision,publishedRevision:Number(result.rows[0].published_revision)});
 }
 async unpublish(actor:string,owner:OutlineOwner){
  const t=TABLES[owner.kind];
  // El borrador conserva lo que estaba publicado: nada se pierde.
  await this.pool.query(`UPDATE ${t.table} SET draft=COALESCE(draft,published),published=NULL,published_at=NULL WHERE ${t.key}=$1`,[owner.id]);
  await this.audit(actor,'OUTLINE_UNPUBLISHED',this.detail(owner));
 }
 async published(slug:string){
  const course=(await this.pool.query(`SELECT c.id,c.slug,c.title,o.published,o.published_revision FROM courses c LEFT JOIN course_outlines o ON o.course_id=c.id WHERE c.slug=$1 AND ${visible}`,[slug])).rows[0];
  if(!course)return undefined;
  const modules=(await this.pool.query(`SELECT m.id,o.published,o.published_revision FROM course_content r JOIN content_modules m ON m.id::text=r.content_ref AND m.deleted_at IS NULL
   JOIN module_outlines o ON o.module_id=m.id AND o.published IS NOT NULL WHERE r.course_id=$1 AND r.kind='MODULE' ORDER BY r.position`,[course.id])).rows;
  const own=(course.published as CourseOutline|null)??null;
  if(!own&&!modules.length)return undefined;
  const weeks=[...(own?.weeks??[]),...modules.flatMap(m=>prefixed(m.published as CourseOutline,modulePrefix(String(m.id))).weeks)];
  const revision=Number(course.published_revision??0)+modules.reduce((n,m)=>n+Number(m.published_revision),0);
  return {courseId:String(course.id),slug:String(course.slug),title:String(course.title),revision,outline:{weeks}};
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
