import {Injectable} from '@nestjs/common';
import {adminAuditEvents,authSessions,emailVerificationTokens,authChallenges,studentProgress,studentProgressEvents,users,and,asc,count,desc,eq,ilike,sql,alias} from '@qapath/database';
import {assertStudentMutation,progressPercent} from '@qapath/administration';
import type {AdministrationPort,AuditRecord,Student,StudentDetail,StudentRow,StudentStatus,StudentProgressView} from '@qapath/administration';
import {emptyProgress,fromUnknown} from '@qapath/progress';
import {DatabaseProvider} from '../database.provider';
const readStudent=(user:typeof users.$inferSelect):Student=>({id:user.id,email:user.email,role:'STUDENT',isActive:user.isActive,emailVerified:!!user.emailVerifiedAt,mustChangePassword:user.mustChangePassword,mfaEnabled:user.mfaEnabled,createdAt:user.createdAt.toISOString(),updatedAt:user.updatedAt.toISOString()});
function overview(row:typeof studentProgress.$inferSelect|null):StudentProgressView{
 const state=row?fromUnknown(row.state):emptyProgress();
 return {completedWeeks:state.weeks,readWeeks:state.read,tasksCount:state.tasks.length,labsCount:state.labs.length,finalCount:state.final.length,quizScores:state.quizzes,scrumCompleted:state.scrumIntro,progressPercent:progressPercent(state.weeks.length),revision:row?.revision??0,updatedAt:row?.updatedAt.toISOString()??null};
}
const escapeLike=(value:string)=>value.replace(/[\\%_]/g,'\\$&');
@Injectable()
export class PostgresAdministrationAdapter implements AdministrationPort {
 constructor(private readonly provider:DatabaseProvider){}
 async list(input:{search:string;status:StudentStatus;page:number;limit:number}){
  const conditions=[eq(users.role,'STUDENT')];
  if(input.status!=='all')conditions.push(eq(users.isActive,input.status==='active'));
  if(input.search)conditions.push(ilike(users.email,`%${escapeLike(input.search)}%`));
  const where=and(...conditions);
  const [rows,totals]=await Promise.all([
   this.provider.db.select({user:users,progress:studentProgress}).from(users).leftJoin(studentProgress,eq(studentProgress.userId,users.id)).where(where).orderBy(desc(users.createdAt),asc(users.email)).limit(input.limit).offset((input.page-1)*input.limit),
   this.provider.db.select({total:count()}).from(users).where(where)
  ]);
  const data:StudentRow[]=rows.map(({user,progress})=>({ ...readStudent(user),completedCount:overview(progress).completedWeeks.length,progressPercent:overview(progress).progressPercent,lastProgressAt:progress?.updatedAt.toISOString()??null}));
  return {data,total:totals[0]?.total??0,page:input.page,limit:input.limit};
 }
 async get(id:string):Promise<StudentDetail|null>{
  const [row]=await this.provider.db.select({user:users,progress:studentProgress}).from(users).leftJoin(studentProgress,eq(studentProgress.userId,users.id)).where(and(eq(users.id,id),eq(users.role,'STUDENT'))).limit(1);
  return row?{student:readStudent(row.user),progress:overview(row.progress)}:null;
 }
 async metrics(){
  const result=await this.provider.db.execute(sql`SELECT COUNT(*)::int AS students,
   COUNT(*) FILTER (WHERE u.is_active)::int AS active_students,
   COUNT(sp.user_id)::int AS students_with_progress,
   COALESCE(ROUND(AVG(COALESCE(jsonb_array_length(CASE WHEN jsonb_typeof(sp.state->'weeks')='array' THEN sp.state->'weeks' ELSE '[]'::jsonb END),0)*100.0/24)),0)::int AS average_progress_percent
   FROM users u LEFT JOIN student_progress sp ON sp.user_id=u.id WHERE u.role='STUDENT'`);
  const row=result.rows[0] as Record<string,unknown>|undefined;
  return {students:Number(row?.students??0),activeStudents:Number(row?.active_students??0),studentsWithProgress:Number(row?.students_with_progress??0),averageProgressPercent:Number(row?.average_progress_percent??0)};
 }
 async create(input:{email:string;passwordHash:string},actorId:string):Promise<Student>{
  return this.provider.db.transaction(async tx=>{
   const [created]=await tx.insert(users).values({email:input.email,passwordHash:input.passwordHash,role:'STUDENT',mustChangePassword:true,emailVerifiedAt:null}).returning();
   await tx.insert(adminAuditEvents).values({actorUserId:actorId,targetUserId:created.id,action:'STUDENT_CREATED',details:{email:created.email}});
   return readStudent(created);
  });
 }
 async change(id:string,change:{isActive?:boolean;email?:string},actorId:string):Promise<Student|null>{
  return this.provider.db.transaction(async tx=>{
   const [previous]=await tx.select().from(users).where(eq(users.id,id)).for('update').limit(1);
   if(!previous)return null;
   assertStudentMutation(actorId,id,previous.role);
   const updates:{isActive?:boolean;email?:string;emailVerifiedAt?:null;updatedAt:Date}={updatedAt:new Date()};
   const details:Record<string,unknown>={};
   if(change.isActive!==undefined&&change.isActive!==previous.isActive){updates.isActive=change.isActive;details.isActive={before:previous.isActive,after:change.isActive};}
   if(change.email!==undefined&&change.email!==previous.email){updates.email=change.email;updates.emailVerifiedAt=null;details.email={before:previous.email,after:change.email};}
   if(!Object.keys(details).length)return readStudent(previous);
   const [updated]=await tx.update(users).set(updates).where(eq(users.id,id)).returning();
   if(updates.email!==undefined){await tx.update(emailVerificationTokens).set({consumedAt:new Date()}).where(and(eq(emailVerificationTokens.userId,id),sql`${emailVerificationTokens.consumedAt} IS NULL`));await tx.update(authChallenges).set({consumedAt:new Date()}).where(and(eq(authChallenges.userId,id),sql`${authChallenges.consumedAt} IS NULL`));}
   if(updates.isActive===false||updates.email!==undefined)await tx.update(authSessions).set({revokedAt:new Date()}).where(and(eq(authSessions.userId,id),sql`${authSessions.revokedAt} IS NULL`));
   await tx.insert(adminAuditEvents).values({actorUserId:actorId,targetUserId:id,action:'STUDENT_UPDATED',details});
   return readStudent(updated);
  });
 }
 async events(id:string,limit:number){
  const found=await this.provider.db.select({id:studentProgressEvents.id,action:studentProgressEvents.action,revision:studentProgressEvents.revision,at:studentProgressEvents.createdAt,details:studentProgressEvents.details}).from(studentProgressEvents).where(eq(studentProgressEvents.userId,id)).orderBy(desc(studentProgressEvents.id)).limit(limit);
  return found.map(x=>({id:String(x.id),action:x.action,revision:x.revision,at:x.at.toISOString(),details:x.details}));
 }
 async audit(input:{studentId?:string;page:number;limit:number}){
  const actor=alias(users,'audit_actor');
  const where=input.studentId?eq(adminAuditEvents.targetUserId,input.studentId):undefined;
  const [found,total]=await Promise.all([
   this.provider.db.select({event:adminAuditEvents,actorEmail:actor.email}).from(adminAuditEvents).leftJoin(actor,eq(actor.id,adminAuditEvents.actorUserId)).where(where).orderBy(desc(adminAuditEvents.id)).limit(input.limit).offset((input.page-1)*input.limit),
   this.provider.db.select({total:count()}).from(adminAuditEvents).where(where)
  ]);
  const data:AuditRecord[]=found.map(({event,actorEmail})=>({id:String(event.id),at:event.createdAt.toISOString(),actorId:event.actorUserId,actorEmail,studentId:event.targetUserId,action:event.action,details:event.details}));
  return {data,total:total[0]?.total??0};
 }
}
