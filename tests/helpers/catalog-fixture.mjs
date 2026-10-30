import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validatedPractice} from './practice-evidence.mjs';
const apiRequire=createRequire(new URL('../../apps/api/package.json',import.meta.url)),webRequire=createRequire(new URL('../../apps/web/package.json',import.meta.url));
apiRequire('reflect-metadata');
const ts=apiRequire('typescript'),root=fileURLToPath(new URL('../../apps/api/',import.meta.url));
const cache=new Map();
export function loadApiSource(path){
 const file=resolve(root,path);if(cache.has(file))return cache.get(file).exports;
 const module={exports:{}};cache.set(file,module);
 const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,experimentalDecorators:true,emitDecoratorMetadata:true}}).outputText;
 new Function('require','module','exports',code)(id=>id.startsWith('.')?loadApiSource(resolve(dirname(file),id+'.ts')):apiRequire(id),module,module.exports);
 return module.exports;
}
export const fixtureUsers={
 admin:{id:'10000000-0000-4000-8000-000000000001',role:'ADMIN',email:'admin@example.test',mfaEnabled:true},
 'student-a':{id:'10000000-0000-4000-8000-000000000002',role:'STUDENT',email:'student-a@example.test',mfaEnabled:false},
 'student-b':{id:'10000000-0000-4000-8000-000000000003',role:'STUDENT',email:'student-b@example.test',mfaEnabled:false},
 instructor:{id:'10000000-0000-4000-8000-000000000004',role:'INSTRUCTOR',email:'instructor@example.test',mfaEnabled:false},
};
/** Test-only PostgreSQL runtime. No DATABASE_URL, network DB or production migration is used. */
export async function createCatalogFixture({port=0,origin='http://localhost:3017'}={}){
 const {PGlite}=webRequire('@electric-sql/pglite');const db=new PGlite();
 for(const file of ['001_initial.sql','002_identity_and_progress.sql','003_administration_audit.sql'])await db.exec(readFileSync(new URL('../../packages/database/sql/'+file,import.meta.url),'utf8'));
 for(const user of Object.values(fixtureUsers))await db.query('INSERT INTO users(id,email,role,password_hash) VALUES($1,$2,$3,$4)',[user.id,user.email,user.role,'test-only-disabled-password']);
 const legacy=await db.query("INSERT INTO courses(slug,title,published) VALUES('cicd','CI/CD histórico',true),('portafolio','Portafolio histórico',true) RETURNING id,slug");
 const lesson=await db.query("INSERT INTO lessons(course_id,week,title) VALUES($1,21,'Lección histórica') RETURNING id",[legacy.rows[0].id]);
 await db.query('INSERT INTO learning_progress(user_id,lesson_id,completed) VALUES($1,$2,true)',[fixtureUsers['student-a'].id,lesson.rows[0].id]);
 const progress=apiRequire('@qapath/progress'),historical=progress.emptyProgress();
 for(const week of [21,22,23,24]){historical.readingSections[week]=[0,1,2,3];historical.lessonChecks.push(week);historical.evidence[`exercise:${week}`]=validatedPractice(week);historical.notes[week]=`Nota histórica ${week}`;}
 historical.quizzes={cicd:100,portafolio:100};const initialProgress=progress.fromUnknown(historical);
 await db.query('INSERT INTO student_progress(user_id,state) VALUES($1,$2::jsonb)',[fixtureUsers['student-a'].id,JSON.stringify(initialProgress)]);
 const migration=readFileSync(new URL('../../packages/database/sql/008_course_catalog.sql',import.meta.url),'utf8');await db.exec(migration);
 for(const file of ['011_course_coming_soon.sql','012_course_lessons.sql','013_lesson_library.sql','014_course_outlines.sql','015_content_modules.sql'])await db.exec(readFileSync(new URL('../../packages/database/sql/'+file,import.meta.url),'utf8'));
 const query=async(sql,args)=>{const result=await db.query(sql,args);return {rows:result.rows,rowCount:result.affectedRows??result.rows.length}};
 let gate=Promise.resolve();
 const pool={query,connect:async()=>{let release;const next=new Promise(done=>{release=done}),previous=gate;gate=previous.then(()=>next);await previous;return {query,release}}};
 const {PostgresCourseCatalogAdapter,PersonalLearningPaths}=loadApiSource('src/infrastructure/adapters/postgres-course-catalog.adapter.ts');
 const repository=new PostgresCourseCatalogAdapter({connection:{pool}}),learning=apiRequire('@qapath/learning');
 const service=new learning.ManageCourseCatalog(repository,new PersonalLearningPaths(repository),3);
 const {PostgresCourseLessonsAdapter}=loadApiSource('src/infrastructure/adapters/postgres-course-lessons.adapter.ts');
 const lessons=new learning.ManageCourseLessons(new PostgresCourseLessonsAdapter({connection:{pool}}),apiRequire('@qapath/contracts').checkStudyFile);
 const {CourseLessonsController,AdminCourseLessonsController}=loadApiSource('src/presentation/controllers/course-lessons.controller.ts');
 const {PostgresCourseOutlineAdapter}=loadApiSource('src/infrastructure/adapters/postgres-course-outline.adapter.ts');
 const outline=new learning.ManageCourseOutline(new PostgresCourseOutlineAdapter({connection:{pool}}),apiRequire('@qapath/contracts').checkStudyFile);
 const {AdminCourseOutlineController,AdminModuleOutlineController,CourseOutlineController,OutlineProgressController}=loadApiSource('src/presentation/controllers/course-outline.controller.ts');
 const {PostgresContentModulesAdapter}=loadApiSource('src/infrastructure/adapters/postgres-content-modules.adapter.ts');
 const modules=new learning.ManageContentModules(new PostgresContentModulesAdapter({connection:{pool}}));
 const {AdminModulesController}=loadApiSource('src/presentation/controllers/content-modules.controller.ts');
 const {NestFactory,APP_GUARD}=apiRequire('@nestjs/core'),nest=apiRequire('@nestjs/common');
 const {OriginGuard,SessionGuard,RolesGuard,Public,cookieName}=loadApiSource('src/presentation/security/session-security.ts');
 const {SecureAuthenticationService}=apiRequire('@qapath/identity');
 const {CourseCatalogController,AdminCoursesController,PersonalPathsController}=loadApiSource('src/presentation/controllers/course-catalog.controller.ts');
 const {CatalogController}=loadApiSource('src/presentation/controllers/catalog.controller.ts'),{ProgressController}=loadApiSource('src/presentation/controllers/progress.controller.ts');
 const {JsonContentAdapter}=loadApiSource('src/infrastructure/adapters/json-content.adapter.ts'),content=new JsonContentAdapter();
 const {CONTENT_REPOSITORY,USE_CASES,PROGRESS_REPOSITORY}=loadApiSource('src/application/tokens.ts');
 const states=new Map([[fixtureUsers['student-a'].id,initialProgress]]);
 const progressPort={get:async id=>structuredClone(states.get(id)||progress.emptyProgress()),apply:async(id,command)=>{const next=progress.applyProgressCommand(states.get(id)||progress.emptyProgress(),command);states.set(id,next);return structuredClone(next)}};
 // Synthetic session endpoints exist only in this localhost fixture, never in the application module.
 class FixtureAuth{
  me(req){const token=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName()+'='))?.split('=')[1];if(!fixtureUsers[token])throw new nest.UnauthorizedException();return {data:fixtureUsers[token]}}
  login(body,res){const token=Object.keys(fixtureUsers).find(key=>fixtureUsers[key].email===body.email);if(!token)throw new nest.UnauthorizedException();res.cookie(cookieName(),token,{httpOnly:true,sameSite:'lax',path:'/'});return {data:{stage:'AUTHENTICATED',user:fixtureUsers[token]}}}
  logout(res){res.clearCookie(cookieName(),{path:'/'});return {data:{ok:true}}}
 }
 nest.Controller('auth')(FixtureAuth);Public()(FixtureAuth);
 for(const [name,decorator,route]of [['me',nest.Get,'me'],['login',nest.Post,'login'],['logout',nest.Post,'logout']])decorator(route)(FixtureAuth.prototype,name,Object.getOwnPropertyDescriptor(FixtureAuth.prototype,name));
 nest.Req()(FixtureAuth.prototype,'me',0);nest.Body()(FixtureAuth.prototype,'login',0);nest.Res({passthrough:true})(FixtureAuth.prototype,'login',1);nest.Res({passthrough:true})(FixtureAuth.prototype,'logout',0);
 const legacyCases={listModules:new learning.ListModules(content),getModule:new learning.GetModule(content),getLesson:new learning.GetLesson(content),getScrum:new learning.GetScrum(content),listResources:new learning.ListResources(content),getProjectChecklist:new learning.GetProjectChecklist(content)};
 class FixtureModule{}
 nest.Module({controllers:[AdminCourseOutlineController,AdminModuleOutlineController,AdminModulesController,CourseOutlineController,OutlineProgressController,CourseLessonsController,AdminCourseLessonsController,CourseCatalogController,AdminCoursesController,PersonalPathsController,CatalogController,ProgressController,FixtureAuth],providers:[{provide:learning.ManageCourseCatalog,useValue:service},{provide:learning.ManageCourseLessons,useValue:lessons},{provide:learning.ManageCourseOutline,useValue:outline},{provide:learning.ManageContentModules,useValue:modules},{provide:CONTENT_REPOSITORY,useValue:content},{provide:PROGRESS_REPOSITORY,useValue:progressPort},...Object.entries(legacyCases).map(([key,value])=>({provide:USE_CASES[key],useValue:value})),{provide:SecureAuthenticationService,useValue:{findSession:async token=>fixtureUsers[token]||null}},{provide:APP_GUARD,useClass:OriginGuard},{provide:APP_GUARD,useClass:SessionGuard},{provide:APP_GUARD,useClass:RolesGuard}]})(FixtureModule);
 process.env.WEB_ORIGIN=origin;
 const app=await NestFactory.create(FixtureModule,{logger:false});app.setGlobalPrefix('api/v1');await app.listen(port,'127.0.0.1');
 return {db,app,repository,service,initialProgress,legacy,migration,base:await app.getUrl(),cookieName:cookieName(),close:async()=>{await app.close();await db.close()}};
}
