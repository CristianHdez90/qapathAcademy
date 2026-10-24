import {pgTable,uuid,varchar,text,timestamp,integer,boolean,uniqueIndex,pgEnum,jsonb,index,bigint} from 'drizzle-orm/pg-core';
import type {Progress} from '@qapath/progress';
export const roleEnum=pgEnum('user_role',['STUDENT','INSTRUCTOR','ADMIN']);
export const users=pgTable('users',{
 id:uuid('id').defaultRandom().primaryKey(),
 email:varchar('email',{length:254}).notNull().unique(),
 passwordHash:text('password_hash').notNull(),
 role:roleEnum('role').notNull().default('STUDENT'),
 failedAttempts:integer('failed_attempts').notNull().default(0),
 lockedUntil:timestamp('locked_until',{withTimezone:true}),
 createdAt:timestamp('created_at',{withTimezone:true}).defaultNow().notNull(),
 isActive:boolean('is_active').notNull().default(true),
 updatedAt:timestamp('updated_at',{withTimezone:true}).notNull().defaultNow(),
 emailVerifiedAt:timestamp('email_verified_at',{withTimezone:true}),
 mustChangePassword:boolean('must_change_password').notNull().default(false),
 mfaEnabled:boolean('mfa_enabled').notNull().default(false)
});
export const authSessions=pgTable('auth_sessions',{
 id:uuid('id').defaultRandom().primaryKey(),userId:uuid('user_id').notNull().references(()=>users.id,{onDelete:'cascade'}),
 tokenHash:varchar('token_hash',{length:64}).notNull().unique(),
 expiresAt:timestamp('expires_at',{withTimezone:true}).notNull(),
 revokedAt:timestamp('revoked_at',{withTimezone:true}),
 createdAt:timestamp('created_at',{withTimezone:true}).defaultNow().notNull()
},t=>[index('sessions_user_idx').on(t.userId)]);
export const studentProgress=pgTable('student_progress',{
 userId:uuid('user_id').primaryKey().references(()=>users.id,{onDelete:'cascade'}),
 state:jsonb('state').$type<Progress>().notNull(),
 revision:integer('revision').notNull().default(1),
 updatedAt:timestamp('updated_at',{withTimezone:true}).notNull().defaultNow()
});
export const courses=pgTable('courses',{
 id:uuid('id').defaultRandom().primaryKey(),slug:varchar('slug',{length:100}).unique().notNull(),
 title:varchar('title',{length:250}).notNull(),published:boolean('published').default(false).notNull()
});
export const lessons=pgTable('lessons',{
 id:uuid('id').defaultRandom().primaryKey(),courseId:uuid('course_id').references(()=>courses.id).notNull(),
 week:integer('week').notNull(),title:varchar('title',{length:250}).notNull(),body:text('body').notNull().default('')
},t=>[uniqueIndex('lesson_course_week_idx').on(t.courseId,t.week)]);
export const learningProgress=pgTable('learning_progress',{
 id:uuid('id').defaultRandom().primaryKey(),userId:uuid('user_id').references(()=>users.id).notNull(),
 lessonId:uuid('lesson_id').references(()=>lessons.id).notNull(),completed:boolean('completed').notNull().default(false),
 completedAt:timestamp('completed_at',{withTimezone:true})
},t=>[uniqueIndex('progress_user_lesson_idx').on(t.userId,t.lessonId)]);

/** Auditoría inmutable de acciones administrativas y sesiones, sin secretos. */
export const adminAuditEvents=pgTable('admin_audit_events',{
 id:bigint('id',{mode:'number'}).generatedAlwaysAsIdentity().primaryKey(),
 actorUserId:uuid('actor_user_id').references(()=>users.id,{onDelete:'set null'}),
 targetUserId:uuid('target_user_id').references(()=>users.id,{onDelete:'set null'}),
 action:varchar('action',{length:64}).notNull(),
 details:jsonb('details').$type<Record<string,unknown>>().notNull().default({}),
 createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow()
},t=>[index('admin_audit_target_idx').on(t.targetUserId,t.createdAt),index('admin_audit_actor_idx').on(t.actorUserId,t.createdAt)]);
export const studentProgressEvents=pgTable('student_progress_events',{
 id:bigint('id',{mode:'number'}).generatedAlwaysAsIdentity().primaryKey(),
 userId:uuid('user_id').notNull().references(()=>users.id,{onDelete:'restrict'}),
 revision:integer('revision').notNull(),
 action:varchar('action',{length:40}).notNull(),
 details:jsonb('details').$type<Record<string,unknown>>().notNull().default({}),
 createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow()
},t=>[uniqueIndex('progress_events_unique_revision').on(t.userId,t.revision),index('student_progress_events_user_idx').on(t.userId,t.createdAt)]);

export const emailVerificationTokens=pgTable('email_verification_tokens',{
 id:uuid('id').defaultRandom().primaryKey(),userId:uuid('user_id').notNull().references(()=>users.id,{onDelete:'cascade'}),
 tokenHash:varchar('token_hash',{length:64}).notNull().unique(),expiresAt:timestamp('expires_at',{withTimezone:true}).notNull(),
 consumedAt:timestamp('consumed_at',{withTimezone:true}),createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow()
});
export const authChallenges=pgTable('auth_challenges',{
 id:uuid('id').defaultRandom().primaryKey(),userId:uuid('user_id').notNull().references(()=>users.id,{onDelete:'cascade'}),
 tokenHash:varchar('token_hash',{length:64}).notNull().unique(),expiresAt:timestamp('expires_at',{withTimezone:true}).notNull(),
 attempts:integer('attempts').notNull().default(0),consumedAt:timestamp('consumed_at',{withTimezone:true}),
 createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow()
});
export const mfaCredentials=pgTable('user_mfa_credentials',{
 userId:uuid('user_id').primaryKey().references(()=>users.id,{onDelete:'cascade'}),
 secretCiphertext:text('secret_ciphertext'),pendingCiphertext:text('pending_ciphertext'),
 pendingUntil:timestamp('pending_until',{withTimezone:true}),lastUsedStep:bigint('last_used_step',{mode:'number'}).notNull().default(-1),
 enabledAt:timestamp('enabled_at',{withTimezone:true}),updatedAt:timestamp('updated_at',{withTimezone:true}).notNull().defaultNow()
});
export const recoveryCodes=pgTable('mfa_recovery_codes',{
 userId:uuid('user_id').notNull().references(()=>users.id,{onDelete:'cascade'}),codeHash:varchar('code_hash',{length:64}).notNull(),
 usedAt:timestamp('used_at',{withTimezone:true}),createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow()
},t=>[uniqueIndex('mfa_recovery_pk').on(t.userId,t.codeHash)]);
