import {CatalogError} from '../domain/course-catalog';
import {LESSON_LIMITS,isExistingFile,validateFiles,validateLessonMeta} from '../domain/course-lessons';
import type {LessonRepositoryPort,LessonStatus,StudyFileValidator,UploadedFile} from '../domain/course-lessons';
type Input={title:string;summary:string;status?:LessonStatus;files:({id:string}|UploadedFile)[]};
/** Biblioteca de contenido: crear, editar, publicar, eliminar (recuperable) y restaurar lecciones. */
export class ManageCourseLessons{
 constructor(private readonly lessons:LessonRepositoryPort,private readonly validate:StudyFileValidator,private readonly limits=LESSON_LIMITS){}
 library(query:{search?:string;deleted?:boolean}={}){return this.lessons.library({search:(query.search||'').trim().slice(0,120),deleted:query.deleted===true})}
 async get(id:string){const lesson=await this.lessons.get(id);if(!lesson)throw new CatalogError('NOT_FOUND','Lección no disponible.');return lesson}
 forCourse(slug:string){return this.lessons.forCourse(slug)}
 async getForCourse(slug:string,id:string){const lesson=await this.lessons.getForCourse(slug,id);if(!lesson)throw new CatalogError('NOT_FOUND','Lección no disponible.');return lesson}
 private prepare(input:Input,existing:boolean){
  validateLessonMeta(input.title,input.summary);
  const status=input.status??'DRAFT';
  const ids=input.files.filter(isExistingFile).map(ref=>ref.id);
  if(!existing&&ids.length)throw new CatalogError('INVALID','Una lección nueva solo admite archivos nuevos.');
  if(new Set(ids).size!==ids.length)throw new CatalogError('INVALID','Hay archivos repetidos en el orden.');
  if(input.files.length>this.limits.files)throw new CatalogError('LIMIT',`Una lección admite hasta ${this.limits.files} archivos.`);
  if(status==='PUBLISHED'&&input.files.length===0)throw new CatalogError('INVALID','Para publicar, la lección necesita al menos un archivo.');
  const files=input.files.map(ref=>isExistingFile(ref)?{id:ref.id}:validateFiles([ref as UploadedFile],this.validate)[0]);
  return {title:input.title.trim(),summary:input.summary.trim(),status,files};
 }
 async create(actor:string,input:Input){return this.lessons.create(actor,this.prepare(input,false),this.limits)}
 async update(actor:string,id:string,revision:number,input:Input){return this.lessons.update(actor,id,revision,this.prepare(input,true),this.limits)}
 remove(actor:string,id:string,revision:number){return this.lessons.remove(actor,id,revision)}
 restore(actor:string,id:string,revision:number){return this.lessons.restore(actor,id,revision)}
}
