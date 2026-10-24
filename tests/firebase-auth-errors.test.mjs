import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {Script,createContext} from 'node:vm';
const require=createRequire(import.meta.url);
const apiRequire=createRequire(new URL('../apps/api/package.json',import.meta.url));
const ts=require('typescript');
function harness(error){
 const source=readFileSync(new URL('../apps/api/src/infrastructure/adapters/firebase-auth.adapter.ts',import.meta.url),'utf8');
 const output=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,experimentalDecorators:true}}).outputText;
 const module={exports:{}},logs=[];
 const context=createContext({module,exports:module.exports,require:apiRequire,AbortSignal,
  process:{env:{NODE_ENV:'test',FIREBASE_PROJECT_ID:'demo-auth',FIREBASE_WEB_API_KEY:'PRIVATE_KEY_VALUE',FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:9099'}},
  console:{warn:message=>logs.push(message)},fetch:async()=>({ok:false,status:400,json:async()=>({error})})});
 new Script(output).runInContext(context);
 return {adapter:new module.exports.FirebaseAuthAdapter(),logs};
}
test('Firebase diagnostic identifies unauthorized verification domain without exposing token or credentials',async()=>{
 const {adapter,logs}=harness({message:'UNAUTHORIZED_DOMAIN'});
 await assert.rejects(adapter.request('sendOobCode',{idToken:'PRIVATE_TOKEN'}),error=>error.status===503&&error.message.includes('[UNAUTHORIZED_DOMAIN]'));
 assert.deepEqual(logs,['FirebaseAuth operation=sendOobCode status=400 code=UNAUTHORIZED_DOMAIN']);
});
test('Google structured API-key restrictions identify blocked backend referrer',async()=>{
 const {adapter,logs}=harness({message:'Requests from referer PRIVATE_EMAIL are blocked.',details:[{reason:'API_KEY_HTTP_REFERRER_BLOCKED'}]});
 await assert.rejects(adapter.authenticate('PRIVATE_EMAIL','PRIVATE_PASSWORD'),error=>error.message.includes('[API_KEY_HTTP_REFERRER_BLOCKED]'));
 assert.equal(logs[0],'FirebaseAuth operation=signInWithPassword status=400 code=API_KEY_HTTP_REFERRER_BLOCKED');
 assert.doesNotMatch(logs.join(),/PRIVATE/);
});
test('unknown provider response text is never reflected into logs or client errors',async()=>{
 const {adapter,logs}=harness({message:'PRIVATE_TOKEN PRIVATE_PASSWORD',details:[{reason:'PRIVATE_EMAIL'}]});
 await assert.rejects(adapter.authenticate('PRIVATE_EMAIL','PRIVATE_PASSWORD'),error=>error.message.includes('[UNKNOWN]')&&!error.message.includes('PRIVATE'));
 assert.doesNotMatch(logs.join(),/PRIVATE/);
});
test('incorrect credentials remain a generic authentication error',async()=>{
 const {adapter}=harness({message:'INVALID_LOGIN_CREDENTIALS'});
 await assert.rejects(adapter.authenticate('PRIVATE_EMAIL','PRIVATE_PASSWORD'),error=>error.message==='Correo o contraseña incorrectos.');
});
