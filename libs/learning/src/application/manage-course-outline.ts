import {CatalogError} from '../domain/course-catalog';
import {countCards,findChapter,gradeChapter,normalizeOutline,publicOutline} from '../domain/course-outline';
import type {CourseOutline,OutlineOwner,OutlineRepositoryPort} from '../domain/course-outline';
import type {StudyFileValidator} from '../domain/course-lessons';
const EMPTY:CourseOutline={weeks:[]};
/** Edición (borrador → publicado) y lectura enfocada del contenido de un curso. */
export class ManageCourseOutline{
 constructor(private readonly repo:OutlineRepositoryPort,private readonly validate:StudyFileValidator){}
 async admin(owner:OutlineOwner){
  const state=await this.repo.load(owner);if(!state)throw new CatalogError('NOT_FOUND',owner.kind==='module'?'Módulo no disponible.':'Curso no disponible.');
  const draft=state.draft??state.published??EMPTY;
  return {courseId:owner.id,ownerKind:owner.kind,title:state.title,draft,draftRevision:state.draftRevision,draftUpdatedAt:state.draftUpdatedAt?.toISOString()??null,published:state.published,publishedRevision:state.publishedRevision,publishedAt:state.publishedAt?.toISOString()??null,dirty:JSON.stringify(draft)!==JSON.stringify(state.published??EMPTY)};
 }
 async saveDraft(actor:string,owner:OutlineOwner,expectedRevision:number,outline:CourseOutline,action='OUTLINE_DRAFT_SAVED'){
  await this.repo.saveDraft(actor,owner,expectedRevision,normalizeOutline(outline,this.validate),action);return this.admin(owner);
 }
 async publish(actor:string,owner:OutlineOwner,expectedRevision:number){
  const state=await this.admin(owner);
  if(state.draftRevision!==expectedRevision)throw new CatalogError('CONFLICT','El contenido cambió. Recarga antes de publicar.');
  if(!countCards(state.draft))throw new CatalogError('INVALID','Para publicar, agrega al menos una tarjeta.');
  for(const chapter of state.draft.weeks.flatMap(w=>w.chapters))if(!chapter.cards.length)throw new CatalogError('INVALID',`El capítulo «${chapter.title}» no tiene tarjetas.`);
  await this.repo.publish(actor,owner,expectedRevision);return this.admin(owner);
 }
 async unpublish(actor:string,owner:OutlineOwner){await this.repo.unpublish(actor,owner);return this.admin(owner)}
 async discard(actor:string,owner:OutlineOwner,expectedRevision:number){
  const state=await this.repo.load(owner);if(!state)throw new CatalogError('NOT_FOUND','Contenido no disponible.');
  await this.repo.saveDraft(actor,owner,expectedRevision,state.published??EMPTY,'OUTLINE_DRAFT_DISCARDED');return this.admin(owner);
 }
 async read(slug:string){
  const course=await this.repo.published(slug);if(!course)throw new CatalogError('NOT_FOUND','Este curso no tiene contenido publicado.');
  return {courseId:course.courseId,slug:course.slug,title:course.title,revision:course.revision,weeks:publicOutline(course.outline)};
 }
 async grade(slug:string,chapterId:string,answers:Record<string,number>,studentId?:string){
  const course=await this.repo.published(slug);if(!course)throw new CatalogError('NOT_FOUND','Este curso no tiene contenido publicado.');
  const chapter=findChapter(course.outline,chapterId);if(!chapter)throw new CatalogError('NOT_FOUND','Capítulo no disponible.');
  const result=gradeChapter(chapter,answers);
  if(studentId)await this.repo.recordQuiz(studentId,course.courseId,chapterId,result.percent);
  return result;
 }
 async progress(userId:string,slug:string){const course=await this.repo.published(slug);if(!course)return {readCards:[],passedChapters:{}};return this.repo.progress(userId,course.courseId)}
 async markRead(userId:string,slug:string,cardIds:string[]){
  const course=await this.repo.published(slug);if(!course)throw new CatalogError('NOT_FOUND','Este curso no tiene contenido publicado.');
  const known=new Set(course.outline.weeks.flatMap(w=>w.chapters.flatMap(c=>c.cards.map(card=>card.id))));
  const valid=cardIds.filter(id=>known.has(id));if(!valid.length)return this.repo.progress(userId,course.courseId);
  return this.repo.markRead(userId,course.courseId,valid);
 }
}
