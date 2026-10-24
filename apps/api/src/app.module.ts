import {Module} from '@nestjs/common';
import {APP_GUARD} from '@nestjs/core';
import {GetLesson,GetModule,GetScrum,GradeQuiz,ListModules,ListResources,GetProjectChecklist} from '@qapath/learning';
import type {ContentRepository} from '@qapath/learning';
import {SecureAuthenticationService} from '@qapath/identity';
import {ManageStudents} from '@qapath/administration';
import type {AdministrationPort} from '@qapath/administration';
import type {IdentityRepository} from '@qapath/identity';
import {JsonContentAdapter} from './infrastructure/adapters/json-content.adapter';
import {PostgresIdentityAdapter,PostgresSessionsAdapter} from './infrastructure/adapters/postgres-identity.adapter';
import {PostgresSecurityAdapter} from './infrastructure/adapters/postgres-security.adapter';
import {TotpAdapter} from './infrastructure/adapters/totp.adapter';
import {VerificationEmailAdapter} from './infrastructure/adapters/verification-email.adapter';
import {FirebaseEmailAdapter} from './infrastructure/adapters/firebase-email.adapter';
import {FirebaseAuthAdapter} from './infrastructure/adapters/firebase-auth.adapter';
import {PostgresProgressAdapter} from './infrastructure/adapters/postgres-progress.adapter';
import {PostgresAdministrationAdapter} from './infrastructure/adapters/postgres-administration.adapter';
import {CryptoAuthAdapter,SecureTokensAdapter} from './infrastructure/adapters/crypto-auth.adapter';
import {DatabaseProvider} from './infrastructure/database.provider';
import {CONTENT_REPOSITORY,IDENTITY_REPOSITORY,PROGRESS_REPOSITORY,USE_CASES,ADMIN_REPOSITORY} from './application/tokens';
import {HealthController} from './presentation/controllers/health.controller';
import {CatalogController} from './presentation/controllers/catalog.controller';
import {QuizController} from './presentation/controllers/quiz.controller';
import {AuthController} from './presentation/controllers/auth.controller';
import {ProgressController} from './presentation/controllers/progress.controller';
import {StudentQuizController} from './presentation/controllers/student-quiz.controller';
import {InstructorController} from './presentation/controllers/instructor.controller';
import {AdminController} from './presentation/controllers/admin.controller';
import {OriginGuard,SessionGuard,RolesGuard} from './presentation/security/session-security';
import {DomainExceptionFilter} from './presentation/filters/domain-exception.filter';
import {QaAssistantController} from './presentation/controllers/qa-assistant.controller';
import {GeminiQaAdapter} from './infrastructure/adapters/gemini-qa.adapter';
import {QaQuotaAdapter} from './infrastructure/adapters/qa-quota.adapter';
import {QaConversationsAdapter} from './infrastructure/adapters/qa-conversations.adapter';
@Module({
 controllers:[HealthController,CatalogController,QuizController,AuthController,ProgressController,StudentQuizController,AdminController,InstructorController,QaAssistantController],
 providers:[
  GeminiQaAdapter,QaQuotaAdapter,QaConversationsAdapter,
  DatabaseProvider,PostgresIdentityAdapter,PostgresProgressAdapter,PostgresAdministrationAdapter,CryptoAuthAdapter,PostgresSecurityAdapter,TotpAdapter,FirebaseEmailAdapter,FirebaseAuthAdapter,VerificationEmailAdapter,
  {provide:ADMIN_REPOSITORY,useExisting:PostgresAdministrationAdapter},
  {provide:ManageStudents,useFactory:(repo:AdministrationPort,crypto:CryptoAuthAdapter)=>new ManageStudents(repo,crypto),inject:[ADMIN_REPOSITORY,CryptoAuthAdapter]},
  {provide:IDENTITY_REPOSITORY,useExisting:PostgresIdentityAdapter},
  {provide:PROGRESS_REPOSITORY,useExisting:PostgresProgressAdapter},
  {provide:SecureAuthenticationService,useFactory:(repo:IdentityRepository,crypto:CryptoAuthAdapter,adapter:PostgresIdentityAdapter,security:PostgresSecurityAdapter,totp:TotpAdapter,mailer:VerificationEmailAdapter,external:FirebaseAuthAdapter)=>new SecureAuthenticationService({users:repo,passwords:crypto,sessions:new PostgresSessionsAdapter(adapter),tokens:new SecureTokensAdapter(crypto),security,totp,mailer,...(process.env.AUTH_PROVIDER==='firebase'?{external}:{})}),inject:[IDENTITY_REPOSITORY,CryptoAuthAdapter,PostgresIdentityAdapter,PostgresSecurityAdapter,TotpAdapter,VerificationEmailAdapter,FirebaseAuthAdapter]},
  {provide:APP_GUARD,useClass:OriginGuard},{provide:APP_GUARD,useClass:SessionGuard},{provide:APP_GUARD,useClass:RolesGuard},
  {provide:CONTENT_REPOSITORY,useClass:JsonContentAdapter},
  {provide:USE_CASES.listModules,useFactory:(repo:ContentRepository)=>new ListModules(repo),inject:[CONTENT_REPOSITORY]},
  {provide:USE_CASES.getModule,useFactory:(repo:ContentRepository)=>new GetModule(repo),inject:[CONTENT_REPOSITORY]},
  {provide:USE_CASES.getLesson,useFactory:(repo:ContentRepository)=>new GetLesson(repo),inject:[CONTENT_REPOSITORY]},
  {provide:USE_CASES.getScrum,useFactory:(repo:ContentRepository)=>new GetScrum(repo),inject:[CONTENT_REPOSITORY]},
  {provide:USE_CASES.gradeQuiz,useFactory:(repo:ContentRepository)=>new GradeQuiz(repo),inject:[CONTENT_REPOSITORY]},
  {provide:USE_CASES.listResources,useFactory:(repo:ContentRepository)=>new ListResources(repo),inject:[CONTENT_REPOSITORY]},
  {provide:USE_CASES.getProjectChecklist,useFactory:(repo:ContentRepository)=>new GetProjectChecklist(repo),inject:[CONTENT_REPOSITORY]},
  DomainExceptionFilter
 ]
})
export class AppModule {}
