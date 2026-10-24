import {ConflictException,Injectable,NotFoundException} from '@nestjs/common';
import {DatabaseProvider} from '../database.provider';

type Message={role:'user'|'assistant';content:string};
type Conversation={id:string;title:string;messages:Message[];revision:number;archived:boolean;createdAt:Date;updatedAt:Date};
const columns=`id,title,messages,revision,archived,created_at AS "createdAt",updated_at AS "updatedAt"`;

@Injectable()
export class QaConversationsAdapter {
 constructor(private readonly provider:DatabaseProvider){}
 async list(userId:string,offset=0){
  const {rows}=await this.provider.connection.pool.query<Omit<Conversation,'messages'>>(
   `SELECT id,title,revision,archived,created_at AS "createdAt",updated_at AS "updatedAt" FROM qa_conversations WHERE user_id=$1 ORDER BY updated_at DESC,id DESC LIMIT 51 OFFSET $2`,[userId,offset]);
  return {items:rows.slice(0,50),nextOffset:rows.length>50?offset+50:null};
 }
 async get(userId:string,id:string){
  const {rows}=await this.provider.connection.pool.query<Conversation>(`SELECT ${columns} FROM qa_conversations WHERE id=$1 AND user_id=$2`,[id,userId]);
  if(!rows[0])throw new NotFoundException('Conversación no encontrada.');
  return rows[0];
 }
 async prepare(userId:string,question:string,id?:string,revision?:number){
  if(id){
   const current=await this.get(userId,id);
   if(current.archived)throw new ConflictException('Restaura la conversación antes de continuar.');
   if(current.revision!==revision)throw new ConflictException('La conversación cambió. Vuelve a abrirla desde el historial.');
   if(current.messages.length>=200)throw new ConflictException('Esta conversación alcanzó 100 respuestas. Archívala e inicia una nueva.');
   return current;
  }
  const {rows}=await this.provider.connection.pool.query<Conversation>(`INSERT INTO qa_conversations(user_id,title) VALUES($1,$2) RETURNING ${columns}`,[userId,question.replace(/\s+/g,' ').slice(0,100)]);
  return rows[0];
 }
 async append(userId:string,current:Conversation,question:string,answer:string){
  const messages=[...current.messages,{role:'user',content:question},{role:'assistant',content:answer}];
  const {rows}=await this.provider.connection.pool.query<Conversation>(
   `UPDATE qa_conversations SET messages=$1::jsonb,revision=revision+1,updated_at=now() WHERE id=$2 AND user_id=$3 AND revision=$4 AND archived=false RETURNING ${columns}`,
   [JSON.stringify(messages),current.id,userId,current.revision]);
  if(!rows[0])throw new ConflictException('La conversación cambió durante la consulta. Ábrela de nuevo desde el historial.');
  return rows[0];
 }
 async archive(userId:string,id:string,archived:boolean){
  const {rows}=await this.provider.connection.pool.query<Conversation>(`UPDATE qa_conversations SET archived=$1,revision=revision+1,updated_at=now() WHERE id=$2 AND user_id=$3 RETURNING ${columns}`,[archived,id,userId]);
  if(!rows[0])throw new NotFoundException('Conversación no encontrada.');
  return rows[0];
 }
}
