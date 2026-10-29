import {Injectable} from '@nestjs/common';
import {studentProgress,studentProgressEvents,sql,eq} from '@qapath/database';
import {applyProgressCommand,emptyProgress,fromUnknown,mergeProgress} from '@qapath/progress';
import type {Progress,ProgressCommand,StudentProgressPort} from '@qapath/progress';
import {DatabaseProvider} from '../database.provider';
@Injectable()
export class PostgresProgressAdapter implements StudentProgressPort {
 constructor(private readonly provider:DatabaseProvider){}
 async get(userId:string):Promise<Progress>{
  const [row]=await this.provider.db.select().from(studentProgress).where(eq(studentProgress.userId,userId)).limit(1);
  return row?fromUnknown(row.state):emptyProgress();
 }
 private async transact(userId:string,change:(current:Progress)=>Progress,action:string,details:Record<string,unknown>):Promise<Progress>{
  return this.provider.db.transaction(async tx=>{
   await tx.insert(studentProgress).values({userId,state:emptyProgress()}).onConflictDoNothing();
   // Atomic row lock: concurrent updates from multiple devices never lose changes.
   const rows=await tx.execute(sql`SELECT state, revision FROM student_progress WHERE user_id = ${userId}::uuid FOR UPDATE`);
   const current=fromUnknown(rows.rows[0]?.state);
   const updated=change(current);
   const revision=Number(rows.rows[0]?.revision??0)+1;
   await tx.update(studentProgress).set({state:updated,revision:sql`${studentProgress.revision}+1`,updatedAt:new Date()}).where(eq(studentProgress.userId,userId));
   await tx.insert(studentProgressEvents).values({userId,revision,action,details});
   return updated;
  });
 }
 apply(userId:string,command:ProgressCommand){
  // No incluir notas ni datos potencialmente privados en los eventos.
  const details:Record<string,unknown>=command.type==='toggle'?{key:command.key,...(typeof command.value==='number'?{value:command.value}:{})}:
   command.type==='note'||command.type==='lesson-answer'||command.type==='reading-section'?{week:command.week}:command.type==='submit-evidence'?{kind:command.kind,id:command.id}:command.type==='grade'?{moduleId:command.moduleId,score:command.score}:command.type==='foundation-card-read'?{cardId:command.cardId}:command.type==='foundation-check-passed'?{questionId:command.questionId}:command.type==='scrum-grade'?{score:command.score}:{};
  return this.transact(userId,s=>applyProgressCommand(s,command),command.type.toUpperCase(),details);
 }
 // Imported JSON cannot award completion, reading, assessment scores or submitted evidence.
 import(userId:string,previous:Progress){return this.transact(userId,s=>mergeProgress(s,{...emptyProgress(),notes:previous.notes}),'IMPORT',{notes:Object.keys(previous.notes).length});}
}
