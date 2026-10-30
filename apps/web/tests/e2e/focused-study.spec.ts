import {test,expect} from '@playwright/test';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
const requireProgress=createRequire(resolve(__dirname,'../../../../package.json'));
const {emptyProgress,applyProgressCommand}=requireProgress('./libs/progress/dist/index.js') as typeof import('@qapath/progress');

test.beforeEach(async({page})=>{await page.route('**/api/v1/auth/me',route=>route.fulfill({status:401,json:{message:'No autenticado'}}))});

test('focused pilot mounts one concept, preserves aliases/history, and never credits navigation',async({page})=>{
 await page.goto('/study/3?view=focused');
 await expect(page.getByRole('button',{name:'← Anterior',exact:true})).toBeDisabled();
 await expect(page.locator('.focused-card .reading-concept')).toHaveCount(0);
 const next=page.getByRole('button',{name:'Siguiente →',exact:true});await next.click();await next.click();
 await expect(page.locator('.focused-card .reading-concept')).toHaveCount(1);
 await expect(page.locator('[data-study-title]')).toBeFocused();
 await expect(page.locator('[data-study-step]')).toHaveAttribute('data-study-step','chapter-0--concept-w3-s0-c0');
 await next.click();await expect(page.locator('[data-study-step]')).toHaveAttribute('data-study-step','chapter-0--concept-w3-s0-c1');
 await page.goBack();await expect(page.locator('[data-study-step]')).toHaveAttribute('data-study-step','chapter-0--concept-w3-s0-c0');
 await page.reload();await expect(page.locator('[data-study-step]')).toHaveAttribute('data-study-step','chapter-0--concept-w3-s0-c0',{timeout:15000});await expect(page.locator('.focused-card .reading-concept')).toHaveCount(1);
 await page.goto('/study/3?view=focused#chapter-1');await expect(page.locator('[data-study-step]')).toHaveAttribute('data-study-step','chapter-1--intro');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('qapath-academy-v2')||'{}').readingSections||{})).toEqual({});
});

test('modal index traps focus and restores exact opener; drafts and answers survive unmount',async({page})=>{
 await page.goto('/study/3?view=focused#study-notes');
 const note=page.getByRole('textbox',{name:'Mis notas',exact:true});await note.fill('Conclusiones de revisión que deben conservarse entre tarjetas.');
 const opener=page.getByRole('button',{name:'Avance del curso',exact:true});await opener.click();
 const dialog=page.getByRole('dialog',{name:'Avance del curso',exact:true}),close=dialog.getByRole('button',{name:'Cerrar Avance del curso'});
 await expect(close).toBeFocused();await page.keyboard.press('Shift+Tab');await expect(dialog.getByRole('link').last()).toBeFocused();await page.keyboard.press('Tab');await expect(close).toBeFocused();
 await page.keyboard.press('Escape');await expect(opener).toBeFocused();
 await opener.click();await dialog.getByRole('link',{name:'Autoevaluación',exact:false}).click();
 await expect(page.locator('[data-study-title]')).toBeFocused();
 const option=page.locator('.option').first();await option.click();
 await opener.click();await dialog.getByRole('link',{name:'Mis notas',exact:false}).click();await expect(note).toHaveValue('Conclusiones de revisión que deben conservarse entre tarjetas.');
 await opener.click();await dialog.getByRole('link',{name:'Autoevaluación',exact:false}).click();await expect(option).toHaveAttribute('aria-pressed','true');
});

test('MariBug keeps its draft with updated card context and never sends on opening',async({page})=>{
 await page.route('**/api/v1/auth/me',route=>route.fulfill({json:{data:{id:'focused-student',role:'STUDENT',email:'student@example.test'}}}));
 await page.route('**/api/v1/me/progress',route=>route.fulfill({json:{data:{read:[],weeks:[],evidence:{},quizzes:{},lessonChecks:[],readingSections:{},notes:{},scrum:[]}}}));
 await page.route('**/api/v1/assistant/conversations*',route=>route.fulfill({json:{data:{items:[],nextOffset:null}}}));
 let sends=0;await page.route('**/api/v1/assistant/chat',route=>{sends++;return route.fulfill({status:503,json:{message:'Error de prueba recuperable'}})});
 await page.goto('/study/3?view=focused#chapter-0--concept-w3-s0-c0');
 const opener=page.getByRole('button',{name:'MariBug',exact:true});await opener.click();
 const dialog=page.getByRole('dialog',{name:'MariBug, asistente de QA Engineer'}),draft=dialog.getByRole('textbox',{name:'Tu pregunta sobre QA'});
 await expect(dialog.getByText('Semana 3 · Rol y necesidad de usuario',{exact:true})).toBeVisible();
 await dialog.getByRole('button',{name:'Maximizar chat',exact:true}).click();await expect(dialog.getByRole('button',{name:'Restaurar tamaño del chat'})).toHaveAttribute('aria-pressed','true');
 await draft.fill('Mi pregunta pendiente debe conservarse.');
 await page.keyboard.press('Escape');await expect(opener).toBeFocused();expect(await page.evaluate(()=>document.body.style.overflow)).not.toBe('hidden');
 await page.getByRole('button',{name:'Siguiente →',exact:true}).click();await opener.click();
 await expect(dialog.getByText('Semana 3 · Historia y conversación',{exact:true})).toBeVisible();await expect(draft).toHaveValue('Mi pregunta pendiente debe conservarse.');
 await dialog.getByRole('button',{name:'Usar pregunta de esta tarjeta'}).click();await expect(draft).toHaveValue(/Historia y conversación/);await expect(draft).toBeFocused();expect(sends).toBe(0);
 await page.keyboard.press('Escape');await expect(opener).toBeFocused();
});

test('responsive content, isolated layout, and keyboard menu at five widths',async({page})=>{
 test.setTimeout(90_000);
 for(const width of [320,390,768,1024,1440]){
  await page.setViewportSize({width,height:900});await page.goto('/study/7?view=focused#chapter-0');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(page.locator('.app-shell>.sidebar[aria-label="Menú lateral"]')).not.toBeVisible();
  await page.getByRole('button',{name:'Menú',exact:true}).click();const menu=page.getByRole('dialog',{name:'Menú del curso'});
  await expect(menu).toBeVisible();await expect(menu.getByRole('link',{name:'Entrar / Crear cuenta',exact:false})).toBeVisible();await expect(menu.getByRole('button',{name:'Cerrar Menú del curso'})).toBeFocused();await page.keyboard.press('Shift+Tab');expect(await menu.evaluate(node=>node.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Tab');await expect(menu.getByRole('button',{name:'Cerrar Menú del curso'})).toBeFocused();
  await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'Menú',exact:true})).toBeFocused();
 }
 await page.goto('/resources');await expect(page.locator('.app-shell>.sidebar[aria-label="Menú lateral"]')).toBeVisible();
});

test('remote note failure preserves the draft and retries through the existing provider',async({page})=>{
 let progress=emptyProgress(),offline=true;
 await page.route('**/api/v1/auth/me',route=>route.fulfill({json:{data:{id:'focused-notes',role:'STUDENT',email:'notes@example.test'}}}));
 await page.route('**/api/v1/assistant/conversations*',route=>route.fulfill({json:{data:{items:[],nextOffset:null}}}));
 await page.route('**/api/v1/me/progress',async route=>{
  if(route.request().method()==='PATCH'){
   if(offline)return route.fulfill({status:503,json:{message:'Sin conexión de prueba'}});
   progress=applyProgressCommand(progress,route.request().postDataJSON());
  }
  return route.fulfill({json:{data:progress}});
 });
 await page.goto('/study/8?view=focused#study-notes');
 const notes=page.getByRole('textbox',{name:'Mis notas',exact:true});await notes.fill('Mi nota remota debe sobrevivir al error y al cambio de tarjeta.');
 const index=page.getByRole('button',{name:'Avance del curso',exact:true});await index.click();await page.getByRole('dialog',{name:'Avance del curso'}).getByRole('link',{name:'Autoevaluación',exact:false}).click();
 await expect(page.getByText(/No se pudo guardar en PostgreSQL/).first()).toBeVisible();
 await index.click();await page.getByRole('dialog',{name:'Avance del curso'}).getByRole('link',{name:'Mis notas',exact:false}).click();
 await expect(notes).toHaveValue('Mi nota remota debe sobrevivir al error y al cambio de tarjeta.');
 offline=false;await page.getByRole('button',{name:'Reintentar sincronización',exact:true}).click();
 await expect.poll(()=>progress.notes['8']).toBe('Mi nota remota debe sobrevivir al error y al cambio de tarjeta.');
});

test('late identity initialization does not steal the restored menu focus',async({page})=>{
 let release:()=>void=()=>{};
 const gate=new Promise<void>(resolve=>{release=resolve});
 await page.route('**/api/v1/auth/me',async route=>{await gate;return route.fulfill({status:401,json:{message:'No autenticado'}})});
 await page.goto('/study/7?view=focused#chapter-0');
 const opener=page.getByRole('button',{name:'Menú',exact:true});await opener.click();
 await expect(page.getByRole('dialog',{name:'Menú del curso'})).toBeVisible();await page.keyboard.press('Escape');await expect(opener).toBeFocused();
 release();await expect(page.getByRole('button',{name:'MariBug',exact:true})).toBeEnabled();await expect(opener).toBeFocused();
});
