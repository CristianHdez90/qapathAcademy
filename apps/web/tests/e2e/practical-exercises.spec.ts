import {test,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {Script,createContext} from 'node:vm';
// Exercise the downloadable starter itself, using this suite's isolated local baseURL.
import '../../public/practice/kit/tests/api.spec';
import '../../public/practice/kit/tests/ui.spec';
import '../../public/practice/kit/tests/network.spec';

test('Postman collection and CSV fixtures pass against the actual sandbox',async({request})=>{
 const kit=resolve(__dirname,'../../public/practice/kit');
 const collection=JSON.parse(readFileSync(resolve(kit,'qapath.postman_collection.json'),'utf8'));
 const rows=JSON.parse(readFileSync(resolve(kit,'data/quote-cases.json'),'utf8'));
 for(const folder of collection.item){for(const item of folder.item){for(const row of folder.name==='Datos'?rows:[{}]){
  const variables:Record<string,unknown>={};
  const pm={variables:{set:(key:string,value:unknown)=>{variables[key]=value}},iterationData:{get:(key:string)=>row[key]}};
  for(const event of item.event.filter((event:{listen:string})=>event.listen==='prerequest'))new Script(event.script.exec.join('\n')).runInContext(createContext({pm}));
  const body=item.request.body?.raw.replace(/\{\{(\w+)\}\}/g,(_:string,key:string)=>String(variables[key]));
  const path=item.request.url.replace('{{baseUrl}}','');
  const response=await request.fetch(path,{method:item.request.method,headers:Object.fromEntries(item.request.header.map((h:{key:string;value:string})=>[h.key,h.value])),...(body?{data:JSON.parse(body)}:{})});
  const text=await response.text();const context={pm:{...pm,test:(name:string,run:()=>void)=>{try{run()}catch(error){throw new Error(`${folder.name}/${item.name}: ${name}: ${error}`)}},expect:(actual:unknown)=>({to:{eql:(expected:unknown)=>assert.deepEqual(actual,expected)}}),response:{code:response.status(),json:()=>JSON.parse(text),text:()=>text,headers:{get:(name:string)=>response.headers()[name.toLowerCase()]},to:{have:{status:(expected:number)=>assert.equal(response.status(),expected)}}}}};
  for(const event of item.event.filter((event:{listen:string})=>event.listen==='test'))new Script(event.script.exec.join('\n')).runInContext(createContext(context));
 }}}
});

test('compact practice entry preserves reading and directs execution to the activity',async({page},testInfo)=>{
 await page.route('**/api/v1/auth/me',r=>r.fulfill({status:401,json:{message:'No autenticado'}}));
 await page.goto('/modules/herramientas');
 await page.goto('/study/7#practical-exercise');
 const exercise=page.locator('#practical-exercise');await expect(exercise).toHaveAttribute('open','');
 await expect(exercise.getByRole('heading',{name:'Postman: contratos, códigos HTTP y autorización',exact:true})).toBeVisible();
 await expect(page.locator('#chapter-0')).toBeAttached();await expect(page.locator('.chapter-label').filter({hasText:'PRÁCTICA GUIADA'})).toBeAttached();
 await expect(page.locator('#practice')).toHaveCount(0);await expect(page.locator('#self-check .option')).toHaveCount(3);
 await expect(page.locator('#deliverables')).toHaveCount(0);await expect(exercise.locator('textarea,form')).toHaveCount(0);await expect(exercise.getByRole('link',{name:'Abrir actividad de la semana 7',exact:false})).toHaveAttribute('href','/practice/7');
 for(const width of [1280,390,320]){
  await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),JSON.stringify(await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1&&(!e.closest('.learning-stages,.lesson-outline')||e.matches('.learning-stages,.lesson-outline'))).slice(0,12).map(e=>({tag:e.tagName,class:String(e.className),right:e.getBoundingClientRect().right}))})))).toBe(false);
  if(width===390)await page.screenshot({path:testInfo.outputPath('practical-exercise-mobile.png')});
 }
 const zip=await page.request.get('/practice/qapath-practice-kit.zip');expect(zip.status()).toBe(200);expect((await zip.body()).subarray(0,2).toString()).toBe('PK');
});

test('QA Store executes positive, negative, defect and HTTP scenarios on mobile',async({page},testInfo)=>{
 await page.route('**/api/v1/auth/me',r=>r.fulfill({status:401,json:{message:'No autenticado'}}));
 await page.goto('/practice');await page.getByRole('button',{name:'Cotizar',exact:true}).click();
 await expect(page.getByTestId('quote-total')).toHaveText('35000 COP');
 await page.getByLabel('Cantidad',{exact:true}).fill('3');await page.getByLabel('Cupón',{exact:true}).fill('QA10');await page.getByLabel('Envío',{exact:true}).selectOption('delivery');
 await page.getByRole('button',{name:'Cotizar',exact:true}).click();await expect(page.getByTestId('quote-total')).toHaveText('104500 COP');
 await page.getByLabel('Activar defecto de cálculo (solo práctica)').check();await expect(page.getByTestId('quote-total')).toHaveText('103500 COP');
 await page.getByLabel('Activar defecto de cálculo (solo práctica)').uncheck();await expect(page.getByTestId('quote-total')).toHaveText('104500 COP');
 await page.getByLabel('Cantidad',{exact:true}).fill('0');await page.getByRole('button',{name:'Cotizar',exact:true}).click();await expect(page.getByRole('region',{name:'Cotizador QA Store'}).getByRole('alert')).toContainText('422');await expect(page.getByTestId('quote-total')).toHaveCount(0);
 await page.getByLabel('Código esperado').selectOption('204');await page.getByRole('button',{name:'Ejecutar solicitud HTTP'}).click();await expect(page.locator('.practice-result')).toContainText('HTTP 204');await expect(page.locator('.practice-result')).toContainText('(sin cuerpo)');
 await page.getByLabel('Escenario',{exact:true}).selectOption('access');await page.getByLabel('Token de demostración').selectOption('demo-reader');await page.getByLabel('Permiso solicitado').selectOption('write');await page.getByRole('button',{name:'Ejecutar solicitud HTTP'}).click();await expect(page.locator('.practice-result')).toContainText('HTTP 403');
 await expect(page.getByRole('button',{name:'Colección de Postman',exact:false})).toHaveCount(0);
 await page.goto('/practice/7');await expect(page.locator('.activity-lab')).toHaveAttribute('open','');
 const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Colección de Postman',exact:false}).click();const file=await downloaded;
 const collection=JSON.parse(readFileSync((await file.path())!,'utf8'));expect(collection.variable[0].value).toBe(new URL(page.url()).origin);
 for(const width of [1280,390,320]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);if(width===1280)await page.screenshot({path:testInfo.outputPath('qa-store-desktop.png')})}
});
