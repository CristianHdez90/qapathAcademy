import {Injectable} from '@nestjs/common';
import type {AppearanceRepository,AppearanceState,AppearanceVersion} from '@qapath/administration';
import {appearanceConfigSchema,type AppearanceConfig} from '@qapath/contracts';
import {DatabaseProvider} from '../database.provider';
type SettingsRow={draft:unknown;draft_revision:number;draft_updated_at:Date|null;published:unknown;published_revision:number;published_at:Date|null};
/** Las lecturas se validan de nuevo: un JSON alterado en la base nunca llega al navegador. */
const parse=(value:unknown):AppearanceConfig|null=>{const result=appearanceConfigSchema.safeParse(value);return result.success?result.data:null};
@Injectable()
export class PostgresAppearanceAdapter implements AppearanceRepository<AppearanceConfig>{
 constructor(private readonly database:DatabaseProvider){}
 async load():Promise<AppearanceState<AppearanceConfig>>{
  const {rows}=await this.database.connection.pool.query<SettingsRow>("SELECT draft,draft_revision,draft_updated_at,published,published_revision,published_at FROM site_appearance_settings WHERE id='home'");
  const row=rows[0];
  if(!row)return {draft:null,draftRevision:0,draftUpdatedAt:null,published:null,publishedRevision:0,publishedAt:null};
  return {draft:parse(row.draft),draftRevision:row.draft_revision,draftUpdatedAt:row.draft_updated_at,published:parse(row.published),publishedRevision:row.published_revision,publishedAt:row.published_at};
 }
 async saveDraft(config:AppearanceConfig,expectedRevision:number,actorId:string){
  const client=await this.database.connection.pool.connect();
  try{
   await client.query('BEGIN');
   await client.query("INSERT INTO site_appearance_settings(id) VALUES('home') ON CONFLICT (id) DO NOTHING");
   const updated=await client.query<{draft_revision:number}>("UPDATE site_appearance_settings SET draft=$1::jsonb,draft_revision=draft_revision+1,draft_updated_at=now(),draft_updated_by=$2 WHERE id='home' AND draft_revision=$3 RETURNING draft_revision",[JSON.stringify(config),actorId,expectedRevision]);
   if(!updated.rowCount){await client.query('ROLLBACK');return null;}
   await client.query("INSERT INTO admin_audit_events(actor_user_id,action,details) VALUES($1,'APPEARANCE_DRAFT_SAVED',$2::jsonb)",[actorId,JSON.stringify({preset:config.preset,revision:updated.rows[0].draft_revision,courses:config.courses.length})]);
   await client.query('COMMIT');return updated.rows[0].draft_revision;
  }catch(error){await client.query('ROLLBACK');throw error}finally{client.release()}
 }
 async publish(config:AppearanceConfig,expectedRevision:number,actorId:string,action:'PUBLISHED'|'RESTORED'){
  const client=await this.database.connection.pool.connect();
  try{
   await client.query('BEGIN');
   await client.query("INSERT INTO site_appearance_settings(id) VALUES('home') ON CONFLICT (id) DO NOTHING");
   const row=await client.query<{published_revision:number}>("UPDATE site_appearance_settings SET published=$1::jsonb,published_revision=published_revision+1,published_at=now(),published_by=$2,draft=$1::jsonb,draft_revision=draft_revision+1,draft_updated_at=now(),draft_updated_by=$2 WHERE id='home' AND draft_revision=$3 RETURNING published_revision",[JSON.stringify(config),actorId,expectedRevision]);
   if(!row.rowCount){await client.query('ROLLBACK');return null;}
   const version=row.rows[0].published_revision;
   await client.query("INSERT INTO site_appearance_versions(setting_id,version,action,config,actor_user_id) VALUES('home',$1,$2,$3::jsonb,$4)",[version,action,JSON.stringify(config),actorId]);
   await client.query("INSERT INTO admin_audit_events(actor_user_id,action,details) VALUES($1,$2,$3::jsonb)",[actorId,action==='PUBLISHED'?'APPEARANCE_THEME_PUBLISHED':'APPEARANCE_THEME_RESTORED',JSON.stringify({version,preset:config.preset,courses:config.courses.length})]);
   await client.query('COMMIT');return version;
  }catch(error){await client.query('ROLLBACK');throw error}finally{client.release()}
 }
 async versions(limit:number):Promise<AppearanceVersion<AppearanceConfig>[]>{
  const {rows}=await this.database.connection.pool.query<{version:number;action:'PUBLISHED'|'RESTORED';config:unknown;created_at:Date;email:string|null}>("SELECT v.version,v.action,v.config,v.created_at,u.email FROM site_appearance_versions v LEFT JOIN users u ON u.id=v.actor_user_id WHERE v.setting_id='home' ORDER BY v.version DESC LIMIT $1",[limit]);
  return rows.flatMap(row=>{const config=parse(row.config);return config?[{version:row.version,action:row.action,config,createdAt:row.created_at,actorEmail:row.email}]:[]});
 }
 async version(version:number){
  const {rows}=await this.database.connection.pool.query<{version:number;action:'PUBLISHED'|'RESTORED';config:unknown;created_at:Date}>("SELECT version,action,config,created_at FROM site_appearance_versions WHERE setting_id='home' AND version=$1",[version]);
  const config=rows[0]?parse(rows[0].config):null;
  return config?{version:rows[0].version,action:rows[0].action,config,createdAt:rows[0].created_at,actorEmail:null}:null;
 }
}
