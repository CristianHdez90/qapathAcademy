import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
const web=createRequire(new URL('../apps/web/package.json',import.meta.url)),root=createRequire(import.meta.url),ts=root('typescript');
function load(file,extra={}){const module={exports:{}};const code=ts.transpileModule(readFileSync(new URL('../'+file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;new Function('require','module','exports',code)(name=>extra[name]||web(name),module,module.exports);return module.exports}
const safe=load('apps/web/src/features/courses/safe-return.ts'),auth=load('apps/web/src/features/auth/auth-provider.tsx',{'@/features/courses/safe-return':safe});
test('course return destinations remain local and never bypass login or MFA stages',()=>{
 for(const value of [undefined,'https://evil.example','//evil.example','/\\evil.example','/admin','/learning-paths?next=https://evil.example','/learning-paths/../admin'])assert.equal(safe.safeLearningPathReturn(value),undefined);
 const target='/learning-paths?add=10000000-0000-4000-8000-000000000001';
 assert.equal(safe.safeLearningPathReturn(target),target);
 assert.equal(auth.authRedirect({stage:'AUTHENTICATED',user:{role:'STUDENT'}},target),target);
 assert.equal(auth.authRedirect({stage:'AUTHENTICATED',user:{role:'STUDENT'}},'https://evil.example'),'/account');
 assert.equal(auth.authRedirect({stage:'AUTHENTICATED',user:{role:'ADMIN'}},target),'/admin');
 assert.equal(auth.authRedirect({stage:'MFA_VERIFY'},target),'/auth/continue?next='+encodeURIComponent(target));
 assert.equal(auth.authRedirect({stage:'CHANGE_PASSWORD'},target),'/auth/continue?next='+encodeURIComponent(target));
 assert.equal(auth.authRedirect({stage:'VERIFY_EMAIL'},target),'/verify-email');
});
