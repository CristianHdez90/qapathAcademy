import {test,expect} from '@playwright/test';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import type {Progress,ProgressCommand} from '@qapath/progress';
const requireProgress=createRequire(resolve(__dirname,'../../../../package.json'));
const {emptyProgress,applyProgressCommand}=requireProgress('./libs/progress/dist/index.js') as typeof import('@qapath/progress');

test('recommended next action opens the pending deliverables rather than restarting a lesson',async({page},testInfo)=>{
 const state={...emptyProgress(),readingSections:{1:[0,1,2,3]}};
 await page.route('**/api/v1/auth/me',route=>route.fulfill({status:401,json:{message:'No autenticado'}}));
 await page.addInitScript(value=>localStorage.setItem('qapath-academy-v2',JSON.stringify(value)),state);
 await page.setViewportSize({width:1440,height:1000});await page.goto('/');
 const next=page.getByRole('link',{name:'Continuar: Práctica',exact:false});
 await expect(next).toHaveAttribute('href','/study/1#deliverables');
 await page.screenshot({path:testInfo.outputPath('dashboard-desktop.png')});await next.click();
 await expect(page.locator('#deliverables')).toHaveAttribute('open','');
 await expect(page.locator('#deliverables').getByRole('textbox').first()).toBeVisible();
 await page.locator('#study-notes > summary').click();
 const note=page.getByLabel('Mis notas',{exact:true});await note.fill('Primera idea');await note.fill('Idea revisada para el siguiente reto');
 await expect(note).toHaveValue('Idea revisada para el siguiente reto');
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('qapath-academy-v2')||'{}').notes?.['1'])).toBe('Idea revisada para el siguiente reto');
});

test('notes expose save failures inline, retry preserves text, and contextual Lia waits for user submission',async({page},testInfo)=>{
 let state:Progress=emptyProgress(),failNote=true,aiCalls=0;
 await page.route('**/api/v1/auth/me',r=>r.fulfill({json:{data:{id:'ux-student',email:'student@example.test',role:'STUDENT',mfaEnabled:true}}}));
 await page.route('**/api/v1/me/progress',async route=>{
  if(route.request().method()==='PATCH'){
   const cmd=route.request().postDataJSON() as ProgressCommand;
   if(cmd.type==='note'&&failNote){failNote=false;await route.fulfill({status:503,json:{message:'Servicio temporalmente no disponible'}});return;}
   state=applyProgressCommand(state,cmd);
  }
  await route.fulfill({json:{data:state}});
 });
 await page.route('**/api/v1/assistant/conversations',route=>route.fulfill({json:{data:{items:[],nextOffset:null}}}));
 await page.route('**/api/v1/assistant/chat',async route=>{aiCalls++;const messages=route.request().postDataJSON().messages;await route.fulfill({json:{data:{answer:'Probemos un ejemplo práctico de QA.',conversation:{id:'00000000-0000-4000-8000-000000000001',title:'Ayuda contextual',revision:1,archived:false,updatedAt:new Date().toISOString(),messages:[...messages,{role:'assistant',content:'Probemos un ejemplo práctico de QA.'}]}}}})});
 await page.goto('/study/1');
 await expect(page.getByRole('navigation',{name:'Etapas de la semana'})).toHaveAttribute('aria-busy','false');
 await page.screenshot({path:testInfo.outputPath('study-desktop.png')});
 const notes=page.getByLabel('Mis notas',{exact:true});await expect(notes).not.toBeVisible();
 await page.locator('#study-notes > summary').click();
 await notes.fill('Mi resumen del ciclo de vida del software y los riesgos de calidad.');
 await expect(page.locator('#study-notes').getByRole('button',{name:'Reintentar guardado'})).toBeVisible();
 await expect(notes).toHaveValue('Mi resumen del ciclo de vida del software y los riesgos de calidad.');
 await page.locator('#self-check .option').first().click();
 await expect(page.locator('#self-check .save-feedback.saved')).toBeVisible();
 await expect(notes).toHaveValue('Mi resumen del ciclo de vida del software y los riesgos de calidad.');
 await page.locator('#study-notes').getByRole('button',{name:'Reintentar guardado'}).click();
 await expect(page.locator('#study-notes').getByRole('status')).toHaveText('✓ Guardado en tu cuenta');
 expect(state.notes['1']).toContain('Mi resumen');
 const chapter=page.getByRole('navigation',{name:'Índice de la clase'}).getByRole('link').nth(1);
 const title=await chapter.innerText();await chapter.click();await expect(chapter).toHaveAttribute('aria-current','location');
 const ask=page.getByRole('button',{name:'Preguntar a Lía sobre este tema'});await ask.click();
 const question=page.getByLabel('Tu pregunta sobre QA');await expect(question).toBeFocused();
 await expect(question).toHaveValue(/Estoy estudiando la semana 1/);
 expect(await question.inputValue()).toContain(title.replace(/^\d+\s*/,''));expect(aiCalls).toBe(0);
 await question.press('Escape');await expect(ask).toBeFocused();
 await ask.click();await page.getByRole('button',{name:'Enviar pregunta'}).click();
 await expect(page.getByRole('log')).toContainText('Probemos un ejemplo práctico');expect(aiCalls).toBe(1);
});

test('mobile learning stages, disclosures and keyboard skip link remain usable without horizontal overflow',async({page},testInfo)=>{
 await page.route('**/api/v1/auth/me',r=>r.fulfill({status:401,json:{message:'No autenticado'}}));
 await page.setViewportSize({width:390,height:844});await page.goto('/study/1');
 await expect(page.getByRole('navigation',{name:'Etapas de la semana'})).toHaveAttribute('aria-busy','false');
 await page.screenshot({path:testInfo.outputPath('learning-mobile-top.png')});
 await page.getByRole('link',{name:'Saltar al contenido'}).focus();await expect(page.getByRole('link',{name:'Saltar al contenido'})).toBeFocused();
 await page.keyboard.press('Enter');await expect(page.locator('#contenido')).toBeFocused();
 await expect(page.getByRole('navigation',{name:'Etapas de la semana'})).toBeVisible();
 await page.getByRole('navigation',{name:'Etapas de la semana'}).getByRole('link',{name:/Práctica/}).click();
 await expect(page.locator('#deliverables')).toHaveAttribute('open','');
 await expect(page.locator('#deliverables').getByRole('textbox').first()).toBeVisible();
 for(const width of [390,320]){
  await page.setViewportSize({width,height:844});
  await page.screenshot({path:testInfo.outputPath(`learning-mobile-${width}.png`)});
  const overflow=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,elements:[...document.querySelectorAll('main,main div,main nav,main aside,main section')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,10).map(e=>({class:e.className,width:e.getBoundingClientRect().width}))}));
  expect(overflow.overflow,JSON.stringify(overflow.elements)).toBe(false);
 }
 await page.screenshot({path:testInfo.outputPath('learning-mobile.png')});
});
