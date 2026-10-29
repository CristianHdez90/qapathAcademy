/** SPEC-CONTENT-320 · Lecciones de estudio cargadas por archivos para cualquier curso del catálogo. */
import {CatalogError} from './course-catalog';
export type StudyFileKind='markdown'|'mermaid'|'interaction'|'svg';
export type LessonStatus='DRAFT'|'PUBLISHED'|'ARCHIVED';
export type StudyFile={id:string;kind:StudyFileKind;filename:string;content:string;size:number;position:number};
export type NewStudyFile={kind:StudyFileKind;filename:string;content:string};
export type LessonSummary={id:string;courseId:string;position:number;title:string;summary:string;status:LessonStatus;revision:number;fileCount:number;kinds:StudyFileKind[];updatedAt:string};
export type Lesson=LessonSummary&{files:StudyFile[]};
export type UploadedFile={filename:string;content:string};
/** Elemento del orden final de una lección: archivo existente o nuevo ya validado. */
export type LessonFileRef={id:string}|NewStudyFile;
export const isExistingFile=(ref:{id:string}|object):ref is {id:string}=>'id' in ref;
/** Validador de archivos (formato, tamaño, seguridad). Se inyecta para mantener el dominio sin dependencias. */
export type StudyFileValidator=(filename:string,content:string)=>{ok:true;kind:StudyFileKind;content:string}|{ok:false;message:string};
export const LESSON_LIMITS={files:30,lessons:60};
export function validateLessonMeta(title:string,summary:string){
 if(title.trim().length<3||title.length>160)throw new CatalogError('INVALID','La lección necesita un título de 3 a 160 caracteres.');
 if(summary.length>400)throw new CatalogError('INVALID','El resumen admite hasta 400 caracteres.');
}
export function validateFiles(files:UploadedFile[],validate:StudyFileValidator):NewStudyFile[]{
 return files.map(file=>{const result=validate(file.filename,file.content);if(!result.ok)throw new CatalogError('INVALID',`${file.filename}: ${result.message}`);return {kind:result.kind,filename:file.filename,content:result.content}});
}
export interface LessonRepositoryPort{
 list(courseKey:string,admin:boolean):Promise<LessonSummary[]>;
 get(courseKey:string,lessonId:string,admin:boolean):Promise<Lesson|undefined>;
 create(actor:string,courseId:string,input:{title:string;summary:string;files:NewStudyFile[]},maximum:typeof LESSON_LIMITS):Promise<Lesson>;
 update(actor:string,courseId:string,lessonId:string,input:{revision:number;title:string;summary:string;status:'DRAFT'|'PUBLISHED';files:LessonFileRef[]},maximum:typeof LESSON_LIMITS):Promise<Lesson>;
 archive(actor:string,courseId:string,lessonId:string,revision:number,restore:boolean):Promise<Lesson>;
 reorder(actor:string,courseId:string,order:{id:string;revision:number}[]):Promise<LessonSummary[]>;
}
