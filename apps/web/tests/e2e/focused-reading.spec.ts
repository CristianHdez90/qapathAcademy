import {test,expect,type Page,type TestInfo} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import {studySteps} from '../../src/features/progress/study-steps';
import type {StudyGuide} from '@qapath/contracts';
import {chapterWasTraversed as baselineWasTraversed} from '../../src/features/progress/reading-coverage';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
const requireProgress=createRequire(resolve(__dirname,'../../../../package.json'));
const {emptyProgress,applyProgressCommand}=requireProgress('./libs/progress/dist/index.js') as typeof import('@qapath/progress');
const guides=JSON.parse(readFileSync('../../libs/content/src/data/study-guides.json','utf8')) as Record<string,StudyGuide>;
type Sample={week:number;chapter:number;step:string;delta:number;attentionMs:number;minimumMs:number;source:[number,number,number];local:[number,number];ranges:[number,number][];eligible:boolean};
async function observe(page:Page){await page.addInitScript(()=>{
 const target=window as typeof window&{__d1Evidence:Sample[]};target.__d1Evidence=[];
 window.addEventListener('qapath:reading-observation',event=>target.__d1Evidence.push((event as CustomEvent<Sample>).detail));
})}
const samples=(page:Page)=>page.evaluate(()=>(window as typeof window&{__d1Evidence:Sample[]}).__d1Evidence);
async function evidence(page:Page,info:TestInfo){
 const trace=await samples(page);expect(trace.length).toBeGreaterThan(0);
 for(const item of trace){expect(item.delta).toBeLessThanOrEqual(500);expect(item.minimumMs).toBe(3000);expect(item.eligible).toBe(item.attentionMs>=3000&&baselineWasTraversed(item.ranges));expect(item.local[0]).toBeGreaterThanOrEqual(0);expect(item.local[1]).toBeLessThanOrEqual(1)}
 const path=info.outputPath('d1-source-samples.json');
 writeFileSync(path,JSON.stringify(trace,null,2));
 await info.attach('d1-source-samples.json',{path,contentType:'application/json'});
}
test.beforeEach(async({page})=>{await page.route('**/api/v1/auth/me',route=>route.fulfill({status:401,json:{message:'No autenticado'}}));await page.emulateMedia({reducedMotion:'reduce'})});

test('concept fills the desktop card and reflows on mobile without losing the reading guard',async({page},info)=>{
 test.setTimeout(90_000);
 for(const width of [1920,1440,390,320]){
  await page.setViewportSize({width,height:1080});
  const step=studySteps(guides[4]).find(step=>step.kind==='concept')!;
  await page.goto(`/study/4?view=focused#${step.id}`);
  const region=page.locator('[data-reading-layout="reflow"]');
  await expect(region).toHaveAttribute('data-reading-verified','true',{timeout:15000});
  const card=await page.locator('.focused-card').boundingBox(),concept=await region.locator('.reading-concept').boundingBox();
  expect(concept!.width/card!.width).toBeGreaterThan(.85);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(width===1920){
   expect(concept!.width).toBeGreaterThan(1500);
   await page.locator('.focused-card').screenshot({path:info.outputPath('desktop-full-width.png')});
  }
 }
 const region=page.locator('[data-reading-layout="reflow"]');
 await region.evaluate(node=>{(node as HTMLElement).style.height='20px'});
 await page.bringToFront();await expect(region).toHaveAttribute('data-reading-verified','false');
 await region.evaluate(node=>{(node as HTMLElement).style.height='';window.dispatchEvent(new Event('resize'))});
 await expect(region).toHaveAttribute('data-reading-verified','true');
 await region.locator('.reading-concept dd').evaluate(node=>{node.firstChild!.textContent+=' Texto alterado.'});
 await page.bringToFront();await region.scrollIntoViewIfNeeded();await expect(region).toHaveAttribute('data-reading-verified','false');
});

// Las semanas 1–2 usan Fundamentos v2 (foundation-v2.spec.ts).
for(let week=3;week<=24;week++)test(`week ${week}: every source region is verified without inactive effects`,async({page})=>{
 // A whole guide now also measures source glyphs. Per-assertion and academic limits are unchanged.
 test.setTimeout(120_000);await page.setViewportSize({width:1280,height:900});
 const steps=studySteps(guides[week]).filter(step=>step.chapter!==undefined);
 await page.goto(`/study/${week}?view=focused#${steps[0].id}`);
 await expect(page.getByRole('button',{name:'MariBug',exact:true})).toBeEnabled({timeout:15000});
 for(const step of steps){
  await page.evaluate(id=>{location.hash=id},step.id);
  const region=page.locator('[data-reading-verified]');
  await expect(page.locator('[data-study-step]')).toHaveAttribute('data-study-step',step.id);
  await expect(region,`week ${week}/${step.id}`).toHaveAttribute('data-reading-verified','true');
  await expect(page.locator('[data-reading-blueprint] [id]')).toHaveCount(0);
  await expect(page.locator('[data-reading-blueprint] button:not(:disabled)')).toHaveCount(0);
  await expect(page.locator('[data-reading-measure]')).toHaveCount(0);
 }
});

for(const width of [320,390,768,1024,1440])for(const week of [3,7,9])test(`source geometry week ${week} at ${width}px matches the old reader`,async({page,context})=>{
 test.setTimeout(60_000);const baseline=await context.newPage();await baseline.emulateMedia({reducedMotion:'reduce'});
 await page.setViewportSize({width,height:900});await baseline.setViewportSize({width,height:900});
  const chapter=guides[week].sections.length;
  await baseline.goto(`/study/${week}#chapter-${chapter}`);
  await expect(baseline.getByRole('navigation',{name:'Etapas de la semana'})).toHaveAttribute('aria-busy','false',{timeout:15000});
  await expect(baseline.locator(`#chapter-${chapter}`)).toBeVisible();
  const height=await baseline.locator(`#chapter-${chapter}`).evaluate(el=>el.getBoundingClientRect().height);
  const steps=studySteps(guides[week]).filter(step=>step.chapter===chapter);
  await page.goto(`/study/${week}?view=focused#${steps[0].id}`);
  await expect(page.getByRole('button',{name:'MariBug',exact:true})).toBeEnabled({timeout:15000});
  for(const step of steps){
   await page.evaluate(id=>{location.hash=id},step.id);
   await expect(page.locator('[data-study-step]')).toHaveAttribute('data-study-step',step.id);
   const region=page.locator('[data-reading-verified]');await expect(region).toHaveAttribute('data-reading-verified','true');
   const sourceHeight=Number((await region.getAttribute('data-source-range'))!.split(',')[2]);
   expect(sourceHeight).toBe(height);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
 await baseline.close();
});

test('covering one chapter records it; jumping and dialogs do not fabricate reading',async({page},info)=>{
 await observe(page);
 test.setTimeout(90_000);await page.clock.install();await page.setViewportSize({width:1024,height:1000});
 const steps=studySteps(guides[3]).filter(step=>step.chapter===0);
 await page.goto(`/study/3?view=focused#${steps[0].id}`);await page.bringToFront();
 await expect(page.locator('[data-reading-ready]')).toHaveAttribute('data-reading-ready','true',{timeout:15000});
 await page.getByRole('button',{name:'Avance del curso',exact:true}).click();await page.clock.runFor(5000);
 const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('qapath-academy-v2')||'{}').readingSections||{});
 expect(await saved()).toEqual({});await page.keyboard.press('Escape');
 for(const step of steps){
  await expect(page.locator('[data-study-step]')).toHaveAttribute('data-study-step',step.id);
  // A controlled clock must deliver navigation/layout frames before checking the strict guard.
  for(let frame=0;frame<8;frame++)await page.clock.runFor(32);
  const region=page.locator('[data-reading-verified]');await expect(region).toHaveAttribute('data-reading-verified','true');
  const box=await region.boundingBox();
  for(let y=box!.y;y<box!.y+box!.height;y+=400){await page.evaluate(top=>window.scrollTo(0,top),y);await page.clock.runFor(500)}
  await page.getByRole('button',{name:'Siguiente →',exact:true}).click();
 }
 await expect.poll(async()=>(await saved())['3']).toContain(0);
 await page.locator('.focused-reading-note').screenshot({path:info.outputPath('d1-registered.png')});
 await evidence(page,info);
});

test('static concepts, horizontal code scroll and altered text are checked',async({page})=>{
 test.setTimeout(60_000);await page.emulateMedia({reducedMotion:'no-preference'});
 const step=studySteps(guides[9]).find(step=>step.kind==='concept')!;
 await page.goto(`/study/9?view=focused#${step.id}`);
 await expect(page.getByRole('button',{name:'MariBug',exact:true})).toBeEnabled({timeout:15000});
 const region=page.locator('[data-reading-verified]');await expect(region).toHaveAttribute('data-reading-verified','true');
 await expect(page.locator('.focused-card .concept-demo')).toHaveCount(0);
 const chapter=guides[9].sections.length;await page.goto(`/study/9?view=focused#chapter-${chapter}--code`);await expect(page.getByRole('button',{name:'MariBug',exact:true})).toBeEnabled({timeout:15000});await expect(region).toHaveAttribute('data-reading-verified','true');
 await page.locator('[data-source-tail]').evaluate(node=>{node.scrollLeft=node.scrollWidth});await expect(region).toHaveAttribute('data-reading-verified','true');
 const originalHeight=await region.evaluate(node=>(node as HTMLElement).style.height);
 await region.evaluate(node=>{(node as HTMLElement).style.height='20px'});await page.bringToFront();await expect(region).toHaveAttribute('data-reading-verified','false');
 await region.evaluate((node,height)=>{(node as HTMLElement).style.height=height;window.dispatchEvent(new Event('resize'))},originalHeight);await expect(region).toHaveAttribute('data-reading-verified','true');
 await page.locator('[data-source-tail] code').evaluate(node=>{node.textContent+='\nContenido alterado para probar el bloqueo.'});
 await region.scrollIntoViewIfNeeded();await page.bringToFront();await expect(region).toHaveAttribute('data-reading-verified','false');
});

test('reading waits for provider confirmation and retries without a second queue',async({page},info)=>{
 await observe(page);
 test.setTimeout(90_000);await page.clock.install();await page.setViewportSize({width:1024,height:1000});
 let progress=emptyProgress(),offline=true,attempts=0;
 await page.route('**/api/v1/auth/me',route=>route.fulfill({json:{data:{id:'reading-student',role:'STUDENT',email:'reading@example.test'}}}));
 await page.route('**/api/v1/assistant/conversations*',route=>route.fulfill({json:{data:{items:[],nextOffset:null}}}));
 await page.route('**/api/v1/me/progress',route=>{
  if(route.request().method()==='PATCH'){
   attempts++;if(offline)return route.fulfill({status:503,json:{message:'Error controlado de guardado'}});
   progress=applyProgressCommand(progress,route.request().postDataJSON());
  }
  return route.fulfill({json:{data:progress}});
 });
 const steps=studySteps(guides[3]).filter(step=>step.chapter===0);
 await page.goto(`/study/3?view=focused#${steps[0].id}`);await page.bringToFront();
 await expect(page.locator('[data-reading-ready]')).toHaveAttribute('data-reading-ready','true',{timeout:15000});
 for(const step of steps){
  await expect(page.locator('[data-study-step]')).toHaveAttribute('data-study-step',step.id);
  for(let frame=0;frame<8;frame++)await page.clock.runFor(32);
  const region=page.locator('[data-reading-verified]');await expect(region).toHaveAttribute('data-reading-verified','true');const box=await region.boundingBox();
  for(let y=box!.y;y<box!.y+box!.height;y+=400){await page.evaluate(top=>window.scrollTo(0,top),y);await page.clock.runFor(500)}
  await page.getByRole('button',{name:'Siguiente →',exact:true}).click();
 }
 await expect(page.getByRole('button',{name:'Reintentar sincronización',exact:true})).toBeVisible();
 await page.clock.runFor(5000);expect(attempts).toBe(1);expect(progress.readingSections['3']||[]).toEqual([]);
 await expect(page.getByText('Lectura: 0 de 4 capítulos registrados',{exact:true})).toBeVisible();
 offline=false;await page.getByRole('button',{name:'Reintentar sincronización',exact:true}).click();
 await expect.poll(()=>progress.readingSections['3']).toContain(0);expect(attempts).toBe(2);
 await expect(page.getByText('Lectura: 1 de 4 capítulos registrados',{exact:true})).toBeVisible();
 await evidence(page,info);
});

test('attention pauses for modal and lost focus; cumulative exposure survives resize',async({page},info)=>{
 await observe(page);
 test.setTimeout(90_000);const time=new Date('2026-01-01T00:00:00Z');await page.clock.install({time});await page.clock.pauseAt(new Date(time.getTime()+1000));
 await page.setViewportSize({width:900,height:1200});
 const steps=studySteps(guides[3]).filter(step=>step.chapter===0);
 await page.goto(`/study/3?view=focused#${steps[0].id}`);await page.bringToFront();
 await expect(page.locator('[data-reading-ready]')).toHaveAttribute('data-reading-ready','true',{timeout:15000});
 const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('qapath-academy-v2')||'{}').readingSections||{});
 for(const step of steps){
  await page.evaluate(id=>{location.hash=id},step.id);
  for(let n=0;n<8;n++)await page.clock.runFor(32);
  const region=page.locator('[data-reading-verified]');await expect(region).toHaveAttribute('data-reading-verified','true');
  await region.scrollIntoViewIfNeeded();await page.clock.runFor(250);
 }
 expect(await saved()).toEqual({});
 const count=(await samples(page)).length;
 await page.getByRole('button',{name:'Avance del curso',exact:true}).click();await page.clock.runFor(5000);expect(await saved()).toEqual({});expect((await samples(page)).length).toBe(count);await page.keyboard.press('Escape');
 await page.evaluate(()=>{Object.defineProperty(document,'hasFocus',{configurable:true,value:()=>false})});await page.clock.runFor(5000);expect(await saved()).toEqual({});expect((await samples(page)).length).toBe(count);await page.evaluate(()=>{Reflect.deleteProperty(document,'hasFocus')});
 await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'})});await page.clock.runFor(5000);expect((await samples(page)).length).toBe(count);await page.evaluate(()=>{Reflect.deleteProperty(document,'visibilityState')});
 await page.setViewportSize({width:768,height:1200});for(let n=0;n<8;n++)await page.clock.runFor(32);
 await expect(page.locator('[data-reading-verified]')).toHaveAttribute('data-reading-verified','true');await page.locator('[data-reading-verified]').scrollIntoViewIfNeeded();await page.clock.runFor(4000);
 await expect.poll(async()=>(await saved())['3']).toContain(0);
 await evidence(page,info);
});
