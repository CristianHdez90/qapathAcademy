import {AdminDomainError} from '../domain/admin';
import type {AdministrationPort,StudentStatus} from '../domain/admin';
import {EmailAddress} from '@qapath/identity';
import type {PasswordPort} from '@qapath/identity';
export class ManageStudents {
 constructor(private readonly repo:AdministrationPort,private readonly passwords:PasswordPort){}
 list(search='',status:StudentStatus='all',page=1,limit=15){return this.repo.list({search:search.trim().slice(0,120),status,page,limit});}
 metrics(){return this.repo.metrics();}
 async detail(id:string){const found=await this.repo.get(id);if(!found)throw new AdminDomainError('Estudiante no encontrado.',404);return found;}
 async create(emailRaw:string,password:string,actorId:string){
  const email=EmailAddress.create(emailRaw).value;
  if(password.length<12||password.length>128)throw new AdminDomainError('Contraseña inicial: entre 12 y 128 caracteres.');
  const passwordHash=await this.passwords.hash(password);
  try{return await this.repo.create({email,passwordHash},actorId);}
  catch(error){if((error as {code?:string}).code==='23505')throw new AdminDomainError('Este correo ya está registrado.',409);throw error;}
 }
 async change(id:string,actorId:string,change:{isActive?:boolean;email?:string}){
  if(actorId===id)throw new AdminDomainError('No puedes editar tu propia cuenta administrativa.',403);
  if(!Object.keys(change).length)throw new AdminDomainError('Indica el cambio solicitado.');
  const normalized={...change};
  if(change.email!==undefined)normalized.email=EmailAddress.create(change.email).value;
  try{const updated=await this.repo.change(id,normalized,actorId);if(!updated)throw new AdminDomainError('Estudiante no encontrado.',404);return updated;}
  catch(error){if((error as {code?:string}).code==='23505')throw new AdminDomainError('Este correo ya está registrado.',409);throw error;}
 }
 history(id:string,limit=50){return this.repo.events(id,limit);}
 audit(studentId:string|undefined,page=1,limit=30){return this.repo.audit({studentId,page,limit});}
}
