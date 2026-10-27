import {test,expect,type APIRequestContext} from '@playwright/test';
import {readFile,readFileSync} from 'node:fs';
import {promisify} from 'node:util';
import {createHash,randomUUID} from 'node:crypto';
import {join} from 'node:path';
import {activityProfiles} from '../../src/features/practice/activity-fields';

const read=promisify(readFile);
const exercises=JSON.parse(readFileSync(join(__dirname,'../../../../libs/content/src/data/practical-exercises.json'),'utf8')) as Record<string,{title:string}>;
function draft(week:number,length:number){
 const report={execution:{mode:week===24?'topic':'scenario',source:'{}',output:'Expediente sintético de prueba',config:{quantity:'1'},ok:false,at:'2026-10-26T12:00:00Z',attachment:''},week,title:exercises[String(week)].title,fieldNames:activityProfiles[week].fields,fields:['Conservar íntegro el expediente de entrenamiento.','',''],completion:'draft'};
 report.execution.attachment='x'.repeat(length-JSON.stringify(report).length);
 const text=JSON.stringify(report);expect(text.length).toBe(length);return text;
}

for(const week of [23,24])for(const length of [8001,32000]){
 test('guest week '+week+' preserves a '+length+'-unit draft through UI save and reload',async({page})=>{
  // All writes in this test are browser-local; no account or database is contacted.
  await page.route('**/api/v1/auth/me',route=>route.fulfill({status:401,json:{message:'Visitante de prueba'}}));
  await page.route('**/api/v1/me/progress**',route=>route.abort());
  const text=draft(week,length);
  await page.addInitScript(({week,text})=>{
   if(!localStorage.getItem('qapath-academy-v2'))localStorage.setItem('qapath-academy-v2',JSON.stringify({version:2,evidence:{['exercise:'+week]:text}}));
  },{week,text});
  await page.goto('/practice/'+week);
  const wizard=page.locator(week===23?'.project-evidence':'.presentation-evidence');
  await wizard.locator('summary').click();
  await wizard.getByRole('button',{name:'Guardar borrador',exact:true}).click();
  const save=wizard.getByRole('button',{name:'Guardar evidencia de esta actividad',exact:true});
  await expect(save).toBeEnabled();
  await save.click();
  await expect(wizard.getByText('✓ Guardado en este navegador',{exact:true})).toBeVisible();
  const stored=()=>page.evaluate(week=>JSON.parse(localStorage.getItem('qapath-academy-v2')||'{}').evidence?.['exercise:'+week] as string|undefined,week);
  expect(await stored()).toBe(text);
  await page.reload();
  await wizard.locator('summary').click();
  await wizard.getByRole('button',{name:'Guardar borrador',exact:true}).click();
  await expect(save).toBeEnabled();
  await save.click();
  await expect(wizard.getByText('✓ Guardado en este navegador',{exact:true})).toBeVisible();
  expect(await stored()).toBe(text);
  await expect(page.getByRole('button',{name:'Finalizar práctica',exact:true})).toBeDisabled();
 });
}

test('isolated PostgreSQL: 23/24 roundtrip, failed writes and account isolation',async({playwright,baseURL})=>{
 test.setTimeout(120000);
 // This opt-in requires a separately approved disposable database + local test-inbox.
 // Never enable it for a developer connection whose database isolation is unknown.
 const allowed=process.env.SPEC110_ALLOW_ISOLATED_DB==='true'&&process.env.E2E_ALLOW_DB_WRITES==='true'&&!!process.env.TEST_INBOX_DIR;
 test.skip(!allowed,'Requires separate approval: SPEC110_ALLOW_ISOLATED_DB=true, E2E_ALLOW_DB_WRITES=true and a disposable local test-inbox database.');
 const target=new URL(baseURL||'http://127.0.0.1:3000');
 expect(['localhost','127.0.0.1','[::1]']).toContain(target.hostname);
 async function student(){
  const api=await playwright.request.newContext({baseURL:target.origin,extraHTTPHeaders:{Origin:target.origin}});
  const suffix=randomUUID(),email='spec110-'+suffix+'@example.test',password='Spec110-local-'+suffix;
  try{
   expect((await api.post('/api/v1/auth/register',{data:{email,password}})).ok()).toBe(true);
   let token='';
   const inbox=join(process.env.TEST_INBOX_DIR!,createHash('sha256').update(email).digest('hex')+'.json');
   await expect.poll(async()=>{try{token=(JSON.parse(await read(inbox,'utf8')) as {token:string}).token;return typeof token==='string'&&token.length>30}catch{return false}},{timeout:20000}).toBe(true);
   expect((await api.post('/api/v1/auth/verify-email',{data:{token}})).ok()).toBe(true);
   const login=await api.post('/api/v1/auth/login',{data:{email,password}});
   expect((await login.json() as {data:{stage:string}}).data.stage).toBe('AUTHENTICATED');
   return api;
  }catch(error){await api.dispose();throw error}
 }
 const accounts:APIRequestContext[]=[];
 try{
  const a=await student();accounts.push(a);const b=await student();accounts.push(b);
  for(const week of [23,24]){
   const text=draft(week,32000),command={type:'submit-evidence',kind:'exercise',id:String(week),text};
   const saved=await a.patch('/api/v1/me/progress',{data:command});expect(saved.status()).toBe(200);
   expect((await saved.json()).data.evidence['exercise:'+week]).toBe(text);
   const rejected=await a.patch('/api/v1/me/progress',{data:{...command,text:text+'x'}});expect(rejected.status()).toBe(400);
   expect((await(await a.get('/api/v1/me/progress')).json()).data.evidence['exercise:'+week]).toBe(text);
   expect((await(await b.get('/api/v1/me/progress')).json()).data.evidence['exercise:'+week]).toBeUndefined();
  }
  const response=await b.post('/api/v1/me/progress/import',{data:{version:2,weeks:[23],notes:{'1':'Resumen sintético de importación'},quizzes:{portafolio:100},evidence:{'exercise:23':draft(23,32000)}}});
  expect(response.status()).toBe(201);
  const imported=(await response.json()).data;
  expect(imported.evidence).toEqual({});expect(imported.quizzes).toEqual({});expect(imported.notes['1']).toBe('Resumen sintético de importación');
 }finally{for(const api of accounts)await api.dispose()}
});

