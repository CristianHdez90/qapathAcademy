import {CatalogError} from '../domain/course-catalog';
import {LESSON_LIMITS,isExistingFile,validateFiles,validateLessonMeta} from '../domain/course-lessons';
import type {LessonRepositoryPort,StudyFileValidator,UploadedFile} from '../domain/course-lessons';
/** Contenido de estudio por archivos: borrador → publicado → archivado (nunca se borra el historial ni el progreso). */
export class ManageCourseLessons{
 constructor(private readonly lessons:LessonRepositoryPort,private readonly validate:StudyFileValidator,private readonly limits=LESSON_LIMITS){}
 list(courseKey:string,admin=false){return this.lessons.list(courseKey,admin)}
 async get(courseKey:string,lessonId:string,admin=false){const lesson=await this.lessons.get(courseKey,lessonId,admin);if(!lesson)throw new CatalogError('NOT_FOUND','Lección no disponible.');return lesson}
 async create(actor:string,courseId:string,input:{title:string;summary:string;files:UploadedFile[]}){
  validateLessonMeta(input.title,input.summary);
  if(input.files.length>this.limits.files)throw new CatalogError('LIMIT',`Una lección admite hasta ${this.limits.files} archivos.`);
  return this.lessons.create(actor,courseId,{title:input.title.trim(),summary:input.summary.trim(),files:validateFiles(input.files,this.validate)},this.limits);
 }
 async update(actor:string,courseId:string,lessonId:string,input:{revision:number;title:string;summary:string;status:'DRAFT'|'PUBLISHED';files:({id:string}|UploadedFile)[]}){
  validateLessonMeta(input.title,input.summary);
  const ids=input.files.filter(isExistingFile).map(ref=>ref.id);
  if(new Set(ids).size!==ids.length)throw new CatalogError('INVALID','Hay archivos repetidos en el orden.');
  if(input.files.length>this.limits.files)throw new CatalogError('LIMIT',`Una lección admite hasta ${this.limits.files} archivos.`);
  if(input.status==='PUBLISHED'&&input.files.length===0)throw new CatalogError('INVALID','Para publicar, la lección necesita al menos un archivo.');
  const files=input.files.map(ref=>isExistingFile(ref)?{id:ref.id}:validateFiles([ref as UploadedFile],this.validate)[0]);
  return this.lessons.update(actor,courseId,lessonId,{revision:input.revision,status:input.status,title:input.title.trim(),summary:input.summary.trim(),files},this.limits);
 }
 archive(actor:string,courseId:string,lessonId:string,revision:number){return this.lessons.archive(actor,courseId,lessonId,revision,false)}
 restore(actor:string,courseId:string,lessonId:string,revision:number){return this.lessons.archive(actor,courseId,lessonId,revision,true)}
 async reorder(actor:string,courseId:string,order:{id:string;revision:number}[]){if(new Set(order.map(item=>item.id)).size!==order.length)throw new CatalogError('INVALID','Orden con lecciones repetidas.');return this.lessons.reorder(actor,courseId,order)}
}
