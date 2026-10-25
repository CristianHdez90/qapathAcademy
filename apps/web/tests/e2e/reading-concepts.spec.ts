import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
test.beforeEach(async({page})=>{
 await page.route('**/api/v1/auth/me',route=>route.fulfill({status:401,json:{message:'No autenticado'}}));
});

test('every foundation card has a workplace example and an explanatory sequence',async({page})=>{
 for(const [week,count] of [[1,25],[2,23]]){
  await page.goto(`/study/${week}`);
  await expect(page.locator('.reading-concept')).toHaveCount(count);
  await expect(page.locator('.concept-example')).toHaveCount(count);
  await expect(page.locator('.concept-demo')).toHaveCount(count);
  await expect(page.locator('.concept-demo li')).toHaveCount(count*3);
  await expect(page.locator('.concept-demo-step-icon')).toHaveCount(count*3);
  await expect(page.locator('.concept-demo-step-number')).toHaveCount(count*3);
  await expect(page.locator('.concept-demo').last()).toHaveAttribute('data-motion','idle');
 }
});

test('the remaining route has specific cards, automatic animations and mobile layout',async({page},testInfo)=>{
 test.setTimeout(120000);
 for(const [week,count] of [[3,10],[4,10],[5,12],[6,10],[7,11],[8,9],[9,9],[10,9],[11,9],[12,10],[13,10],[14,9],[15,9],[16,9],[17,9],[18,9],[19,9],[20,9],[21,10],[22,10],[23,11],[24,11]]){
  await page.goto(`/study/${week}`);
  await expect(page.locator('.reading-concept')).toHaveCount(count);
  await expect(page.locator('.concept-example')).toHaveCount(count);
  await expect(page.locator('.concept-demo-node .concept-demo-step-icon')).toHaveCount(count*3);
  expect(await page.locator('.concept-demo-node svg').evaluateAll(icons=>icons.every(icon=>icon.children.length>0))).toBe(true);
  const demo=page.locator('.concept-demo').first();await demo.scrollIntoViewIfNeeded();
  await expect(demo).toHaveAttribute('data-motion','playing');
 }
 for(const week of [3,7,9,13,17,21,23]){
  await page.setViewportSize({width:320,height:800});await page.goto(`/study/${week}`);
  const demo=page.locator('.concept-demo').first();await demo.scrollIntoViewIfNeeded();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(demo).toHaveAttribute('data-motion','playing');
  if(week===21)await page.locator('.reading-concept').first().screenshot({path:testInfo.outputPath('ci-card-mobile.png')});
 }
});

test('advanced lesson download keeps code and guided steps with reduced motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/study/17');
 await expect(page.locator('.concept-demo[data-motion="reduced"]')).toHaveCount(9);
 const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Descargar clase',exact:false}).click();
 const file=await(await pending).path();const content=await readFile(file!,'utf8');
 expect(content).toContain('class LoginPage');expect(content).toContain('Crea una clase para LoginPage.');
 expect(content).toContain('Situación:');expect(content).toContain('Secuencia:');
 expect(await page.locator('.concept-demo').evaluateAll(elements=>elements.flatMap(el=>el.getAnimations({subtree:true})).length)).toBe(0);
});

test('animation can play, pause, continue and repeat without marking progress',async({page},testInfo)=>{
 await page.goto('/study/1');const card=page.locator('.reading-concept-qa');const demo=card.locator('.concept-demo');
 await demo.scrollIntoViewIfNeeded();
 await expect(demo).toHaveAttribute('data-motion','playing');
 await card.getByRole('button',{name:'Pausar animación: Aseguramiento de calidad (QA)',exact:true}).click();
 await expect(demo).toHaveAttribute('data-motion','paused');
 expect(await demo.evaluate(el=>el.getAnimations({subtree:true}).every(a=>a.playState==='paused'))).toBe(true);
 await card.screenshot({path:testInfo.outputPath('qa-example-desktop.png')});
 await demo.scrollIntoViewIfNeeded();
 await card.getByRole('button',{name:'Continuar animación: Aseguramiento de calidad (QA)',exact:true}).click();
 await expect(demo).toHaveAttribute('data-motion','done',{timeout:9000});
 await card.getByRole('button',{name:'Repetir animación: Aseguramiento de calidad (QA)',exact:true}).click();
 await expect(demo).toHaveAttribute('data-motion','playing');
 const progress=await page.evaluate(()=>JSON.parse(localStorage.getItem('qapath-academy-v2')||'{}'));
 expect(progress.weeks||[]).toEqual([]);
});

test('reduced motion keeps all explanations static and class download includes examples',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/study/2');
 await expect(page.locator('.concept-demo[data-motion="reduced"]')).toHaveCount(23);
 expect(await page.locator('.concept-demo').evaluateAll(elements=>elements.flatMap(el=>el.getAnimations({subtree:true})).length)).toBe(0);
 await expect(page.locator('.concept-demo').first().getByRole('button')).toBeDisabled();
 const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Descargar clase',exact:false}).click();const download=await pending;
 const file=await download.path();expect(file).not.toBeNull();const content=await readFile(file!,'utf8');
 expect(content).toContain('Situación:');expect(content).toContain('Qué hace QA:');expect(content).toContain('Secuencia:');expect(content).toContain('Valorar pago: I5 y P4');
});

test('expanded cards and animation controls fit mobile width',async({page},testInfo)=>{
 await page.setViewportSize({width:320,height:800});await page.goto('/study/1');
 const card=page.locator('.reading-concept-qa');await card.scrollIntoViewIfNeeded();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await card.screenshot({path:testInfo.outputPath('qa-example-mobile.png')});
 await card.locator('.concept-demo').scrollIntoViewIfNeeded();
 await expect(card.locator('.concept-demo')).toHaveAttribute('data-motion','playing');
});

test('scroll pauses offscreen playback and preserves an explicit pause',async({page})=>{
 await page.goto('/study/1');const card=page.locator('.reading-concept-qa');const demo=card.locator('.concept-demo');
 await demo.scrollIntoViewIfNeeded();await expect(demo).toHaveAttribute('data-motion','playing');
 await page.evaluate(()=>scrollTo(0,0));await expect(demo).toHaveAttribute('data-motion','paused');
 await demo.scrollIntoViewIfNeeded();await expect(demo).toHaveAttribute('data-motion','playing');
 await card.getByRole('button',{name:'Pausar animación: Aseguramiento de calidad (QA)',exact:true}).click();
 await page.evaluate(()=>scrollTo(0,0));await demo.scrollIntoViewIfNeeded();await demo.hover();
 await expect(demo).toHaveAttribute('data-motion','paused');
});

test('pointer and keyboard focus restart a completed visible animation',async({page})=>{
 await page.goto('/study/1');const demo=page.locator('.reading-concept-qa .concept-demo');
 await demo.scrollIntoViewIfNeeded();await expect(demo).toHaveAttribute('data-motion','playing');
 const finish=async()=>{await demo.locator('.concept-demo-track i').evaluate(el=>el.getAnimations().forEach(animation=>animation.finish()));await expect(demo).toHaveAttribute('data-motion','done')};
 await finish();await page.mouse.move(0,0);await demo.hover();await expect(demo).toHaveAttribute('data-motion','playing');
 await finish();await page.mouse.move(0,0);await demo.getByRole('button').evaluate(el=>(el as HTMLButtonElement).blur());await demo.getByRole('button').focus();
 await expect(demo).toHaveAttribute('data-motion','playing');
});

test('a long chapter still records reading on a small screen',async({page})=>{
 await page.setViewportSize({width:320,height:740});await page.goto('/study/1');
 await page.bringToFront();await page.locator('#chapter-0 .reading-concept-qa').scrollIntoViewIfNeeded();
 expect(await page.locator('#chapter-0').evaluate(el=>el.getBoundingClientRect().height*.15>innerHeight)).toBe(true);
 await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('qapath-academy-v2')||'{}').readingSections?.['1']||[]),{timeout:15000}).toContain(0);
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('qapath-academy-v2')||'{}'));
 expect(stored.weeks||[]).toEqual([]);
});
