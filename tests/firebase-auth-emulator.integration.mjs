import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {randomUUID} from 'node:crypto';
const require=createRequire(import.meta.url);
const apiRequire=createRequire(new URL('../apps/api/package.json',import.meta.url));
const {FirebaseAuthAdapter,readFirebaseAuthConfig}=require('../apps/api/dist/infrastructure/adapters/firebase-auth.adapter');
const {getAuth}=apiRequire('firebase-admin/auth');
const {getApps}=apiRequire('firebase-admin/app');
const enabled=!!process.env.FIREBASE_AUTH_EMULATOR_HOST&&process.env.FIREBASE_PROJECT_ID?.startsWith('demo-');

test('production refuses emulator configuration and requires provider configuration',()=>{
 assert.throws(()=>readFirebaseAuthConfig({NODE_ENV:'production',FIREBASE_PROJECT_ID:'demo-test',FIREBASE_WEB_API_KEY:'test',FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:9099'}),/producción/);
 assert.throws(()=>readFirebaseAuthConfig({}),/FIREBASE_PROJECT_ID/);
});
test('Firebase Auth emulator: credentials, verification delivery, UID, password changes and disabled sessions',{skip:!enabled},async()=>{
 const adapter=new FirebaseAuthAdapter();
 const email=`firebase-${randomUUID()}@example.test`,password=`Test-${randomUUID()}!`;
 const identity=await adapter.register(email,password);
 assert.equal(identity.email,email);assert.equal(identity.emailVerified,false);
 await assert.rejects(adapter.authenticate(email,'wrong-password'));
 await adapter.sendVerification(email,password);
 const inbox=await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/emulator/v1/projects/${process.env.FIREBASE_PROJECT_ID}/oobCodes`).then(r=>r.json());
 const code=inbox.oobCodes.find(item=>item.email===email&&item.requestType==='VERIFY_EMAIL')?.oobCode;
 assert.ok(code,'The emulator must receive a Firebase verification email');
 const verified=await adapter.verifyEmail(code);assert.equal(verified.uid,identity.uid);assert.equal(verified.emailVerified,true);
 assert.equal((await adapter.authenticate(email,password)).emailVerified,true);
 assert.equal(await adapter.validSession(identity.uid,email,new Date()),true);
 assert.equal(await adapter.validSession(identity.uid,email,new Date(0)),false);
 await assert.rejects(adapter.verifyEmail(code));
 const nextPassword=`Changed-${randomUUID()}!`;await adapter.changePassword(identity.uid,nextPassword);
 await assert.rejects(adapter.authenticate(email,password));await adapter.authenticate(email,nextPassword);
 const admin=getAuth(getApps().find(app=>app.name==='qapath-auth'));
 await admin.updateUser(identity.uid,{disabled:true});
 assert.equal(await adapter.validSession(identity.uid,email,new Date()),false);
 await assert.rejects(adapter.authenticate(email,nextPassword));
 await admin.deleteUser(identity.uid);
});
