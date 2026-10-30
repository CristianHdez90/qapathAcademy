/** SPEC-CONTENT-331 · Módulos propios: contenido reutilizable (semanas → capítulos → tarjetas) asignable a cursos. */
import {CatalogError} from './course-catalog';
export type ContentModule={id:string;title:string;summary:string;track:string;revision:number;updatedAt:string;deletedAt:string|null;published:boolean;weeks:number;courses:{id:string;slug:string;title:string}[]};
export type ModuleInput={title:string;summary:string;track:string};
export function validateModule(input:ModuleInput){
 if(input.title.trim().length<3||input.title.length>160)throw new CatalogError('INVALID','El módulo necesita un nombre de 3 a 160 caracteres.');
 if(input.summary.length>1000||!input.track.trim()||input.track.length>80)throw new CatalogError('INVALID','Revisa la descripción y el área del módulo.');
}
export interface ModuleRepositoryPort{
 list(deleted:boolean):Promise<ContentModule[]>;
 get(id:string):Promise<ContentModule|undefined>;
 create(actor:string,input:ModuleInput):Promise<ContentModule>;
 update(actor:string,id:string,revision:number,input:ModuleInput):Promise<ContentModule>;
 /** Eliminar recuperable: lo quita de los cursos (queda en auditoría). Restaurar lo devuelve sin asignar. */
 remove(actor:string,id:string,revision:number):Promise<ContentModule>;
 restore(actor:string,id:string,revision:number):Promise<ContentModule>;
}
