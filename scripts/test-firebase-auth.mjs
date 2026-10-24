/** Integration runner: local emulator + freshly created, disposable PostgreSQL database. */
import {createRequire} from 'node:module';
import {randomBytes} from 'node:crypto';
import {existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const require=createRequire(import.meta.url);
const {Pool}=require('../packages/database/node_modules/pg');
if(!process.env.DATABASE_URL&&existsSync('apps/api/.env'))process.loadEnvFile('apps/api/.env');
let source;
try{source=new URL(process.env.DATABASE_URL||'')}catch{throw new Error('Configura una DATABASE_URL válida para PostgreSQL local.');}
if(!['localhost','127.0.0.1','[::1]'].includes(source.hostname))throw new Error('La prueba solo admite PostgreSQL local. No se ejecutará contra Neon ni producción.');
const database=`qapath_firebase_test_${randomBytes(6).toString('hex')}`;
const admin=new Pool({connectionString:source.toString(),max:1});
let created=false;
const environment={...process.env,CI:'true',AUTH_PROVIDER:'firebase',FIREBASE_PROJECT_ID:'demo-qapath-auth',FIREBASE_WEB_API_KEY:'local-emulator-key',
 MFA_ENCRYPTION_KEY:randomBytes(32).toString('hex'),APP_URL:'http://127.0.0.1:3100',E2E_BASE_URL:'http://127.0.0.1:3100',
 API_INTERNAL_URL:'http://127.0.0.1:4100',API_PROXY_TARGET:'http://127.0.0.1:4100',EMAIL_TRANSPORT:'console'};
// Do not accidentally enable unrelated tests or real Firebase/SMTP credentials.
for(const key of ['GOOGLE_APPLICATION_CREDENTIALS','FIREBASE_SERVICE_ACCOUNT_EMAIL','FIREBASE_PRIVATE_KEY','E2E_ALLOW_DB_WRITES','E2E_ADMIN_EMAIL','E2E_ADMIN_PASSWORD','E2E_ADMIN_TOTP_SECRET','TEST_INBOX_DIR','FIREBASE_AUTH_EMULATOR_HOST'])delete environment[key];
function run(command,args,extra={}){
 // Only fixed, repository-owned command arguments are passed to the Windows shell.
 const argumentsForShell=process.platform==='win32'?args.map(arg=>/[\s&]/.test(arg)?`"${arg}"`:arg):args;
 const result=spawnSync(command,argumentsForShell,{stdio:'inherit',env:{...environment,...extra},shell:process.platform==='win32'});
 if(result.status!==0)throw new Error(`Falló ${command} (exit ${result.status}).`);
}
try{
 await admin.query(`CREATE DATABASE "${database}"`);created=true;
 const temporary=new URL(source);temporary.pathname=`/${database}`;environment.DATABASE_URL=temporary.toString();
 run('pnpm',['db:migrate']);
 run('pnpm',['build'],{NODE_ENV:'production'});
 // Native Windows browsers share focus; reading tracking requires the active window.
 const workers=process.platform==='win32'?1:2;
 const specs=process.argv.includes('--practice-only')?'tests/e2e/practical-exercises.spec.ts':process.argv.includes('--assistant-only')?'tests/e2e/learning-ux.spec.ts tests/e2e/qa-history.spec.ts':'tests/e2e/academy.spec.ts tests/e2e/firebase-auth.spec.ts tests/e2e/learning-ux.spec.ts tests/e2e/qa-history.spec.ts tests/e2e/practical-exercises.spec.ts tests/e2e/ctfl.spec.ts';
 run('npx',['--yes','firebase-tools@15.34.1','emulators:exec','--config','firebase/auth-emulator.json','--only','auth','--project','demo-qapath-auth',
  `node --test tests/firebase-auth-emulator.integration.mjs tests/qa-conversations.integration.mjs tests/practical-persistence.integration.mjs tests/ctfl-persistence.integration.mjs && pnpm --filter @qapath/web exec playwright test ${specs} --workers ${workers} --retries 0`],{NODE_ENV:'test'});
}finally{
 if(created&&/^qapath_firebase_test_[0-9a-f]{12}$/.test(database))await admin.query(`DROP DATABASE "${database}" WITH (FORCE)`);
 await admin.end();
}
