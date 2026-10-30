import {CatalogError} from '../domain/course-catalog';
import {validateModule} from '../domain/content-modules';
import type {ModuleInput,ModuleRepositoryPort} from '../domain/content-modules';
export class ManageContentModules{
 constructor(private readonly modules:ModuleRepositoryPort){}
 list(deleted=false){return this.modules.list(deleted)}
 async get(id:string){const found=await this.modules.get(id);if(!found)throw new CatalogError('NOT_FOUND','Módulo no disponible.');return found}
 async create(actor:string,input:ModuleInput){const clean={title:input.title.trim(),summary:input.summary.trim(),track:input.track.trim()};validateModule(clean);return this.modules.create(actor,clean)}
 async update(actor:string,id:string,revision:number,input:ModuleInput){const clean={title:input.title.trim(),summary:input.summary.trim(),track:input.track.trim()};validateModule(clean);return this.modules.update(actor,id,revision,clean)}
 remove(actor:string,id:string,revision:number){return this.modules.remove(actor,id,revision)}
 restore(actor:string,id:string,revision:number){return this.modules.restore(actor,id,revision)}
}
