/**
 * SPEC-UX-310 · Caso de uso de apariencia del Home (borrador → publicación → versiones → restauración).
 * El dominio no conoce Zod, HTTP ni SQL: recibe la validación y la persistencia como puertos.
 */
export class AppearanceConflict extends Error{constructor(){super('Otro administrador guardó o publicó cambios. Recarga para continuar.');this.name='AppearanceConflict'}}
export class AppearanceInvalid extends Error{constructor(message:string,readonly issues:unknown[]=[]){super(message);this.name='AppearanceInvalid'}}
export type AppearanceState<T>={draft:T|null;draftRevision:number;draftUpdatedAt:Date|null;published:T|null;publishedRevision:number;publishedAt:Date|null};
export type AppearanceVersion<T>={version:number;action:'PUBLISHED'|'RESTORED';config:T;createdAt:Date;actorEmail:string|null};
export interface AppearanceRepository<T>{
 load():Promise<AppearanceState<T>>;
 /** Guarda el borrador solo si la revisión esperada coincide; devuelve la nueva revisión o null si hubo conflicto. */
 saveDraft(config:T,expectedRevision:number,actorId:string):Promise<number|null>;
 /** Publica atómicamente (estado + versión inmutable + auditoría) si la revisión coincide; devuelve la versión o null. */
 publish(config:T,expectedRevision:number,actorId:string,action:'PUBLISHED'|'RESTORED'):Promise<number|null>;
 versions(limit:number):Promise<AppearanceVersion<T>[]>;
 version(version:number):Promise<AppearanceVersion<T>|null>;
}
export type AppearancePolicy<T>={defaults:T;issues:(config:T)=>unknown[]};
export class ManageAppearance<T>{
 constructor(private readonly repo:AppearanceRepository<T>,private readonly policy:AppearancePolicy<T>){}
 /** Público: solo lo publicado; si no hay publicación o falla la lectura, el preset inicial en código. */
 async published(){
  try{const state=await this.repo.load();if(state.published)return {config:state.published,revision:state.publishedRevision,publishedAt:state.publishedAt,fallback:false};}catch{/* fallback legible (AC-16) */}
  return {config:this.policy.defaults,revision:0,publishedAt:null,fallback:true};
 }
 async adminView(){
  const state=await this.repo.load();const draft=state.draft??state.published??this.policy.defaults;
  return {draft,draftRevision:state.draftRevision,draftUpdatedAt:state.draftUpdatedAt,published:{config:state.published??this.policy.defaults,revision:state.publishedRevision,publishedAt:state.publishedAt,fallback:!state.published},issues:this.policy.issues(draft)};
 }
 async saveDraft(config:T,expectedRevision:number,actorId:string){
  const revision=await this.repo.saveDraft(config,expectedRevision,actorId);
  if(revision===null)throw new AppearanceConflict();
  return {draftRevision:revision,issues:this.policy.issues(config)};
 }
 async publish(expectedRevision:number,actorId:string){
  const state=await this.repo.load();
  if(state.draftRevision!==expectedRevision)throw new AppearanceConflict();
  const draft=state.draft??state.published??this.policy.defaults;
  const issues=this.policy.issues(draft);
  if(issues.length)throw new AppearanceInvalid('El borrador no cumple el contraste mínimo. Corrige los colores antes de publicar.',issues);
  const version=await this.repo.publish(draft,expectedRevision,actorId,'PUBLISHED');
  if(version===null)throw new AppearanceConflict();
  return {version};
 }
 /** Restaurar crea una NUEVA publicación con la configuración de una versión anterior (auditada). */
 async restore(version:number,expectedRevision:number,actorId:string){
  const target=await this.repo.version(version);
  if(!target)throw new AppearanceInvalid('La versión solicitada no existe.');
  const issues=this.policy.issues(target.config);
  if(issues.length)throw new AppearanceInvalid('La versión no cumple el contraste mínimo vigente.',issues);
  const published=await this.repo.publish(target.config,expectedRevision,actorId,'RESTORED');
  if(published===null)throw new AppearanceConflict();
  return {version:published};
 }
 versions(limit=30){return this.repo.versions(Math.min(Math.max(limit,1),100));}
}
