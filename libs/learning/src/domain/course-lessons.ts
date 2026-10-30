/** SPEC-CONTENT-320/321 · Biblioteca de lecciones de estudio cargadas por archivos y asignables a cursos. */
import {CatalogError} from './course-catalog';
export type StudyFileKind='markdown'|'mermaid'|'interaction'|'svg';
export type LessonStatus='DRAFT'|'PUBLISHED';
export type StudyFile={id:string;kind:StudyFileKind;filename:string;content:string;size:number;position:number};
export type NewStudyFile={kind:StudyFileKind;filename:string;content:string};
export type LessonCourseUse={id:string;slug:string;title:string;status:string};
export type LessonSummary={id:string;title:string;summary:string;status:LessonStatus;revision:number;fileCount:number;kinds:StudyFileKind[];updatedAt:string;deletedAt:string|null;courses:LessonCourseUse[]};
export type Lesson=LessonSummary&{files:StudyFile[]};
export type UploadedFile={filename:string;content:string};
/** Elemento del orden final de una lección: archivo existente o nuevo ya validado. */
export type LessonFileRef={id:string}|NewStudyFile;
export const isExistingFile=(ref:{id:string}|object):ref is {id:string}=>'id' in ref;
/** Validador de archivos (formato, tamaño, seguridad). Se inyecta para mantener el dominio sin dependencias. */
export type StudyFileValidator=(filename:string,content:string)=>{ok:true;kind:StudyFileKind;content:string}|{ok:false;message:string};
export const LESSON_LIMITS={files:30,lessons:500};
export function validateLessonMeta(title:string,summary:string){
 if(title.trim().length<3||title.length>160)throw new CatalogError('INVALID','La lección necesita un título de 3 a 160 caracteres.');
 if(summary.length>400)throw new CatalogError('INVALID','El resumen admite hasta 400 caracteres.');
}
export function validateFiles(files:UploadedFile[],validate:StudyFileValidator):NewStudyFile[]{
 return files.map(file=>{const result=validate(file.filename,file.content);if(!result.ok)throw new CatalogError('INVALID',`${file.filename}: ${result.message}`);return {kind:result.kind,filename:file.filename,content:result.content}});
}
export type LessonInput={title:string;summary:string;status:LessonStatus;files:LessonFileRef[]};
export interface LessonRepositoryPort{
 /** Biblioteca (ADMIN): activas o eliminadas. */
 library(query:{search:string;deleted:boolean}):Promise<LessonSummary[]>;
 get(id:string):Promise<Lesson|undefined>;
 /** Estudiantes: solo lecciones publicadas, no eliminadas y asignadas a un curso visible, en el orden del índice. */
 forCourse(slug:string):Promise<LessonSummary[]>;
 getForCourse(slug:string,id:string):Promise<Lesson|undefined>;
 create(actor:string,input:LessonInput,limits:typeof LESSON_LIMITS):Promise<Lesson>;
 update(actor:string,id:string,revision:number,input:LessonInput,limits:typeof LESSON_LIMITS):Promise<Lesson>;
 /** Eliminar recuperable: oculta la lección y la quita de los cursos. Restaurar la devuelve como borrador sin asociar. */
 remove(actor:string,id:string,revision:number):Promise<Lesson>;
 restore(actor:string,id:string,revision:number):Promise<Lesson>;
}
