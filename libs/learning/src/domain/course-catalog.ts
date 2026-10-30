export type CourseStatus='DRAFT'|'PUBLISHED'|'ARCHIVED';
export type ContentKind='LEGACY_MODULE'|'SCRUM'|'CTFL'|'CURATED';
/** LESSON: lección de la biblioteca de contenido (ref = id de la lección). Asignable a cualquier curso. */
export type ContentReference={kind:Exclude<ContentKind,'CURATED'>|'LESSON';ref:string};
export type CourseInput={slug:string;title:string;summary:string;description:string;category:string;skills:string[];position:number;cover:string|null;contentKind:ContentKind;assignments:ContentReference[];comingSoon?:boolean};
export type Course=CourseInput&{id:string;status:CourseStatus;revision:number;createdAt:string;updatedAt:string;usageCount?:number};
export type LearningPath={id:string;title:string;active:boolean;revision:number;courses:{id:string;slug:string;title:string;status:CourseStatus}[];createdAt:string;updatedAt:string};
export type Page<T>={items:T[];total:number;page:number;limit:number};
export class CatalogError extends Error{constructor(public readonly code:'INVALID'|'NOT_FOUND'|'CONFLICT'|'LIMIT',message:string){super(message)}}
export const normalizeCourseSearch=(text:string)=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const moduleRefs=new Set(['fundamentos','manual','herramientas','typescript','playwright','arquitectura','cicd','portafolio']);
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function validContentReference(value:ContentReference){return value.kind==='LESSON'?UUID.test(value.ref):value.kind==='LEGACY_MODULE'?moduleRefs.has(value.ref):value.kind==='SCRUM'?value.ref==='equipo-scrum':value.kind==='CTFL'&&value.ref==='istqb-ctfl'}
/** `publishedLessons` = lecciones asignadas publicadas; undefined = aún desconocido (se verifica dentro de la transacción del repositorio). */
export function validateCourse(input:CourseInput,status:CourseStatus,publishedLessons?:number){
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)||input.slug.length<3||input.slug.length>100)throw new CatalogError('INVALID','Slug inválido: usa minúsculas, números y guiones.');
 if(input.title.trim().length<3||input.title.length>250||input.summary.length>500||input.description.length>8000||!input.category.trim()||input.category.length>80||input.skills.length>24||input.skills.some(s=>!s.trim()||s.length>80)||!Number.isInteger(input.position)||input.position<0||input.position>10000)throw new CatalogError('INVALID','Metadatos del curso inválidos.');
 if(input.cover!==null&&!/^\/course-covers\/[a-zA-Z0-9_-]+\.(svg|png|webp|jpg)$/.test(input.cover))throw new CatalogError('INVALID','La portada debe ser un recurso local permitido.');
 if(input.assignments.filter(ref=>ref.kind!=='LESSON').length>24||input.assignments.some(ref=>!validContentReference(ref))||new Set(input.assignments.map(ref=>ref.kind+':'+ref.ref)).size!==input.assignments.length)throw new CatalogError('INVALID','Asignación de contenido inválida o repetida.');
 const base=input.assignments.filter(ref=>ref.kind!=='LESSON');
 // Las lecciones de la biblioteca se pueden asignar a cualquier curso; el resto debe coincidir con el tipo de curso.
 if(input.assignments.length>200||input.contentKind!=='CURATED'&&(base.length>1||base.some(ref=>ref.kind!==input.contentKind)))throw new CatalogError('INVALID','El origen debe coincidir con el tipo de curso.');
 if(status==='PUBLISHED'&&!input.summary.trim())throw new CatalogError('INVALID','Para publicar, añade un resumen.');
 // Navegable: algún módulo/experiencia asignado o, si solo hay lecciones, al menos una publicada (se verifica en la transacción).
 if(status==='PUBLISHED'&&(!input.assignments.length||(!input.assignments.some(ref=>ref.kind!=='LESSON')&&publishedLessons!==undefined&&publishedLessons<1)))throw new CatalogError('INVALID','Para publicar, asigna contenido navegable: un módulo o al menos una lección publicada.');
}
export function courseTransition(current:Course,next:CourseStatus,restore=false){
 if(current.status==='ARCHIVED'&&(!restore||next!=='DRAFT'))throw new CatalogError('CONFLICT','Restaura el curso como borrador antes de editar o publicar.');
 if(restore&&current.status!=='ARCHIVED')throw new CatalogError('CONFLICT','Solo se restaura un curso archivado.');
}
export function validatePath(title:string,courseIds:string[],maximum=24){
 if(title.trim().length<3||title.length>120)throw new CatalogError('INVALID','La ruta necesita un nombre de 3 a 120 caracteres.');
 if(!courseIds.length||courseIds.length>maximum||new Set(courseIds).size!==courseIds.length)throw new CatalogError('INVALID','Selecciona cursos sin duplicados y dentro del límite permitido.');
}
export type CourseQuery={search:string;category?:string;status?:CourseStatus;page:number;limit:number};
export interface CourseRepositoryPort{
 list(query:CourseQuery,admin:boolean):Promise<Page<Course>>;
 get(key:string,admin:boolean):Promise<Course|undefined>;
 create(actor:string,input:CourseInput):Promise<Course>;
 update(actor:string,id:string,revision:number,input:CourseInput,status:CourseStatus):Promise<Course>;
 transition(actor:string,id:string,revision:number,status:CourseStatus,restore:boolean):Promise<Course>;
}
export interface LearningPathRepositoryPort{
 list(owner:string):Promise<LearningPath[]>;
 get(owner:string,id:string):Promise<LearningPath|undefined>;
 save(owner:string,id:string|undefined,input:{title:string;courseIds:string[];active:boolean;revision?:number},maximum:number):Promise<LearningPath>;
 remove(owner:string,id:string,revision:number):Promise<void>;
}
