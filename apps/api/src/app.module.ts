import {Module} from '@nestjs/common';
import {ManageCourseCatalog,ManageCourseLessons,ManageCourseOutline} from '@qapath/learning';
import {PostgresCourseOutlineAdapter} from './infrastructure/adapters/postgres-course-outline.adapter';
import {AdminCourseOutlineController,CourseOutlineController,OutlineProgressController} from './presentation/controllers/course-outline.controller';
import {checkStudyFile} from '@qapath/contracts';
import {PostgresCourseLessonsAdapter} from './infrastructure/adapters/postgres-course-lessons.adapter';
import {CourseLessonsController,AdminCourseLessonsController} from './presentation/controllers/course-lessons.controller';
import {PostgresCourseCatalogAdapter,PersonalLearningPaths} from './infrastructure/adapters/postgres-course-catalog.adapter';
import {CourseCatalogController,AdminCoursesController,PersonalPathsController} from './presentation/controllers/course-catalog.controller';
import {APP_GUARD} from '@nestjs/core';
import {GetLesson,GetModule,GetScrum,GradeQuiz,GradeFoundationCheck,ListModules,ListResources,GetProjectChecklist} from '@qapath/learning';
import type {ContentRepository} from '@qapath/learning';
import {SecureAuthenticationService} from '@qapath/identity';
import {ManageStudents,ManageAppearance} from '@qapath/administration';
import {DEFAULT_APPEARANCE,contrastIssues,type AppearanceConfig} from '@qapath/contracts';
import {AppearanceController,AdminAppearanceController} from './presentation/controllers/appearance.controller';
import {PostgresAppearanceAdapter} from './infrastructure/adapters/postgres-appearance.adapter';
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
import {PracticeController} from './presentation/controllers/practice.controller';
import {HealthController} from './presentation/controllers/health.controller';
import {CatalogController} from './presentation/controllers/catalog.controller';
import {QuizController} from './presentation/controllers/quiz.controller';
import {AuthController} from './presentation/controllers/auth.controller';
import {ProgressController} from './presentation/controllers/progress.controller';
import {StudentQuizController} from './presentation/controllers/student-quiz.controller';
import {FoundationCheckController,StudentFoundationCheckController} from './presentation/controllers/foundation-check.controller';
import {InstructorController} from './presentation/controllers/instructor.controller';
import {AdminController} from './presentation/controllers/admin.controller';
import {OriginGuard,SessionGuard,RolesGuard} from './presentation/security/session-security';
import {DomainExceptionFilter} from './presentation/filters/domain-exception.filter';
import {QaAssistantController} from './presentation/controllers/qa-assistant.controller';
import {GeminiQaAdapter} from './infrastructure/adapters/gemini-qa.adapter';
import {QaQuotaAdapter} from './infrastructure/adapters/qa-quota.adapter';
import {QaConversationsAdapter} from './infrastructure/adapters/qa-conversations.adapter';
import {AiSettingsController} from './presentation/controllers/ai-settings.controller';
import {AiSettingsAdapter} from './infrastructure/adapters/ai-settings.adapter';
import {GroqQaAdapter} from './infrastructure/adapters/groq-qa.adapter';
import {QaAiAdapter} from './infrastructure/adapters/qa-ai.adapter';
@Module({
 controllers:[AdminCourseOutlineController,CourseOutlineController,OutlineProgressController,CourseLessonsController,AdminCourseLessonsController,AppearanceController,AdminAppearanceController,CourseCatalogController,AdminCoursesController,PersonalPathsController,AiSettingsController,PracticeController,HealthController,CatalogController,QuizController,AuthController,ProgressController,StudentQuizController,FoundationCheckController,StudentFoundationCheckController,AdminController,InstructorController,QaAssistantController],
 providers:[
  PostgresCourseCatalogAdapter,PostgresCourseLessonsAdapter,PostgresCourseOutlineAdapter,
  {provide:ManageCourseOutline,useFactory:(repo:PostgresCourseOutlineAdapter)=>new ManageCourseOutline(repo,checkStudyFile),inject:[PostgresCourseOutlineAdapter]},
  {provide:ManageCourseLessons,useFactory:(repo:PostgresCourseLessonsAdapter)=>new ManageCourseLessons(repo,checkStudyFile),inject:[PostgresCourseLessonsAdapter]},
  {provide:ManageCourseCatalog,useFactory:(repo:PostgresCourseCatalogAdapter)=>{const limit=Number(process.env.CATALOG_MAX_PATHS||10);if(!Number.isInteger(limit)||limit<1||limit>50)throw new Error('CATALOG_MAX_PATHS debe estar entre 1 y 50');return new ManageCourseCatalog(repo,new PersonalLearningPaths(repo),limit)},inject:[PostgresCourseCatalogAdapter]},
  AiSettingsAdapter,GroqQaAdapter,QaAiAdapter,GeminiQaAdapter,QaQuotaAdapter,QaConversationsAdapter,
  DatabaseProvider,PostgresIdentityAdapter,PostgresProgressAdapter,PostgresAdministrationAdapter,CryptoAuthAdapter,PostgresSecurityAdapter,TotpAdapter,FirebaseEmailAdapter,FirebaseAuthAdapter,VerificationEmailAdapter,
  {provide:ADMIN_REPOSITORY,useExisting:PostgresAdministrationAdapter},
  PostgresAppearanceAdapter,
  {provide:ManageAppearance,useFactory:(repo:PostgresAppearanceAdapter)=>new ManageAppearance<AppearanceConfig>(repo,{defaults:DEFAULT_APPEARANCE,issues:config=>contrastIssues(config.tokens)}),inject:[PostgresAppearanceAdapter]},
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
  {provide:USE_CASES.gradeFoundationCheck,useFactory:(repo:ContentRepository)=>new GradeFoundationCheck(repo),inject:[CONTENT_REPOSITORY]},
  {provide:USE_CASES.listResources,useFactory:(repo:ContentRepository)=>new ListResources(repo),inject:[CONTENT_REPOSITORY]},
  {provide:USE_CASES.getProjectChecklist,useFactory:(repo:ContentRepository)=>new GetProjectChecklist(repo),inject:[CONTENT_REPOSITORY]},
  DomainExceptionFilter
 ]
})
export class AppModule {}
