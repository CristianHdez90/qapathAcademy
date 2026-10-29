import {CatalogError,validateCourse,validatePath} from '../domain/course-catalog';
import type {CourseInput,CourseStatus,CourseQuery,CourseRepositoryPort,LearningPathRepositoryPort} from '../domain/course-catalog';
/** Application ports do not depend on NestJS, SQL, authentication cookies or progress mutation. */
export class ManageCourseCatalog{
 constructor(private readonly courses:CourseRepositoryPort,private readonly paths:LearningPathRepositoryPort,private readonly maximumPaths=10){}
 list(query:CourseQuery,admin=false){return this.courses.list(query,admin)}
 async get(key:string,admin=false){const course=await this.courses.get(key,admin);if(!course)throw new CatalogError('NOT_FOUND','Curso no disponible.');return course}
 create(actor:string,input:CourseInput){validateCourse(input,'DRAFT');return this.courses.create(actor,input)}
 async update(actor:string,id:string,revision:number,input:CourseInput,status:CourseStatus){validateCourse(input,status);return this.courses.update(actor,id,revision,input,status)}
 archive(actor:string,id:string,revision:number){return this.courses.transition(actor,id,revision,'ARCHIVED',false)}
 restore(actor:string,id:string,revision:number){return this.courses.transition(actor,id,revision,'DRAFT',true)}
 listPaths(owner:string){return this.paths.list(owner)}
 async getPath(owner:string,id:string){const path=await this.paths.get(owner,id);if(!path)throw new CatalogError('NOT_FOUND','Ruta no disponible.');return path}
 savePath(owner:string,id:string|undefined,input:{title:string;courseIds:string[];active:boolean;revision?:number}){validatePath(input.title,input.courseIds);return this.paths.save(owner,id,input,this.maximumPaths)}
 removePath(owner:string,id:string,revision:number){return this.paths.remove(owner,id,revision)}
}
