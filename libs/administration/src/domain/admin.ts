/** Bounded context Administration: DTOs de lectura, reglas y puertos sin HTTP/SQL. */
export type StudentStatus='active'|'inactive'|'all';
export type Student={id:string;email:string;role:'STUDENT';isActive:boolean;emailVerified:boolean;mustChangePassword:boolean;mfaEnabled:boolean;createdAt:string;updatedAt:string};
export type StudentProgressView={completedWeeks:number[];readWeeks:number[];tasksCount:number;labsCount:number;finalCount:number;quizScores:Record<string,number>;scrumCompleted:boolean;progressPercent:number;revision:number;updatedAt:string|null};
export type StudentRow=Student&{progressPercent:number;completedCount:number;lastProgressAt:string|null};
export type StudentDetail={student:Student;progress:StudentProgressView};
export type StudentPage={data:StudentRow[];total:number;page:number;limit:number};
export type AdminMetrics={students:number;activeStudents:number;studentsWithProgress:number;averageProgressPercent:number};
export type AuditRecord={id:string;at:string;actorId:string|null;actorEmail:string|null;studentId:string|null;action:string;details:Record<string,unknown>};
export type ProgressEvent={id:string;at:string;action:string;revision:number;details:Record<string,unknown>};
export interface AdministrationPort {
 list(input:{search:string;status:StudentStatus;page:number;limit:number}):Promise<StudentPage>;
 get(id:string):Promise<StudentDetail|null>;
 metrics():Promise<AdminMetrics>;
 create(input:{email:string;passwordHash:string},actorId:string):Promise<Student>;
 change(id:string,change:{isActive?:boolean;email?:string},actorId:string):Promise<Student|null>;
 events(id:string,limit:number):Promise<ProgressEvent[]>;
 audit(input:{studentId?:string;page:number;limit:number}):Promise<{data:AuditRecord[];total:number}>;
}
export class AdminDomainError extends Error{constructor(message:string,readonly status:400|403|404|409=400){super(message);this.name='AdminDomainError';}}
export function assertStudentMutation(actorId:string,targetId:string,targetRole:'STUDENT'|'INSTRUCTOR'|'ADMIN'){
 if(actorId===targetId)throw new AdminDomainError('No puedes modificar tu propia cuenta administrativa.',403);
 if(targetRole!=='STUDENT')throw new AdminDomainError('Este panel administra exclusivamente estudiantes.',403);
}
export function progressPercent(weeksCompleted:number):number{return Math.round(Math.min(24,Math.max(0,weeksCompleted))*100/24);}
