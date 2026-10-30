import {test,expect,type Page} from '@playwright/test';
import foundation from '../../../../libs/content/src/data/fundamentals-v2.json';
import keys from '../../../../libs/content/src/data/fundamentals-v2-keys.json';
const c01=foundation.weeks['1'].chapters[0];
const guest=async(page:Page)=>{await page.route('**/api/v1/auth/me',route=>route.fulfill({status:401,json:{message:'No autenticado'}}))};
const local=(page:Page)=>page.evaluate(()=>JSON.parse(localStorage.getItem('qapath-academy-v2')||'{}'));
async function readCard(page:Page){
 for(let frame=0;frame<6;frame++)await page.clock.runFor(250);
 const box=await page.locator('.foundation-card-body').evaluate(node=>{const r=node.getBoundingClientRect();return {top:r.top+scrollY,height:r.height}});
 for(let y=Math.max(0,box.top-100);y<=box.top+box.height;y+=200){await page.evaluate(top=>scrollTo(0,top),y);await page.clock.runFor(1000)}
 await page.evaluate(end=>scrollTo(0,Math.max(0,end-innerHeight+160)),box.top+box.height);await page.clock.runFor(9000);
}

test.beforeEach(async({page})=>{await guest(page)});

test('week 1 shows only the new curriculum: one card at a time, no self-check, no module quiz, no legacy view',async({page})=>{
 await page.goto('/study/1');
 await expect(page.getByRole('heading',{level:1})).toHaveText('Tipos, enfoques, niveles y pirámide de pruebas');
 await expect(page.locator('[data-foundation-version="fnd-v2"]')).toBeVisible();
 const stages=page.getByRole('navigation',{name:'Etapas de la semana'});
 await expect(stages.getByRole('listitem')).toHaveCount(3);
 await expect(stages).not.toContainText('Autoevaluación');await expect(stages).not.toContainText('Test del módulo');
 await expect(page.getByText(/Mentalidad QA|QA, QC y testing: conceptos diferentes|curriculum=legacy/)).toHaveCount(0);
 await page.goto('/study/1#FND-W01-C01-T04');
 await expect(page.locator('[data-study-step]')).toHaveAttribute('data-study-step','FND-W01-C01-T04');
 await expect(page.locator('.foundation-card-body')).toHaveCount(1);
 await expect(page.getByRole('heading',{level:2})).toHaveText(c01.cards[3].title);
 const next=page.getByRole('navigation',{name:'Navegación por tarjetas'}).getByRole('button',{name:'Siguiente →'});
 await next.click();await expect(page.locator('[data-study-step]')).toHaveAttribute('data-study-step','FND-W01-C01-T05');
 await page.goto('/study/1#FND-W01-C02');await expect(page.getByRole('heading',{level:2})).toHaveText('Enfoques y estrategias de pruebas');
 await page.goto('/study/2#FND-W02-C08-T09');await expect(page.locator('[data-study-step]')).toHaveAttribute('data-study-step','FND-W02-C08-T09');
 await page.goto('/study/1#chapter-0');await expect(page.getByText('Este enlace ya no identifica una tarjeta',{exact:false})).toBeVisible();
});

test('public lesson payload never contains minitest answers',async({request})=>{
 const lesson=await (await request.get('/api/v1/lessons/1')).json();
 const text=JSON.stringify(lesson.data.guide.foundation);
 expect(lesson.data.guide.foundation.chapters).toHaveLength(4);
 expect(lesson.data.guide.foundation.chapters.every((c:{status:string})=>c.status==='published')).toBe(true);
 expect(text).not.toMatch(/"correct"/);
 for(const key of Object.values(keys))for(const feedback of Object.values(key.feedback))expect(text).not.toContain(feedback);
 const graded=await (await request.post('/api/v1/foundation/checks/FND-W01-C01-T02-Q1',{data:{optionId:'a'}})).json();
 expect(graded.data).toMatchObject({correct:true,credited:false});
 expect((await request.post('/api/v1/foundation/checks/FND-W01-C01-T02-Q1',{data:{optionId:'z'}})).status()).toBe(400);
 expect((await request.patch('/api/v1/me/progress',{data:{type:'foundation-check-passed',questionId:'FND-W01-C01-T02-Q1'}})).status()).toBeGreaterThanOrEqual(400);
});

test('a minitest counts only after the card is read; feedback, retry and no fabricated credit',async({page},testInfo)=>{
 test.setTimeout(90_000);await page.clock.install();
 await page.goto('/study/1#FND-W01-C01-T02');await page.bringToFront();
 const check=page.locator('[data-check-id="FND-W01-C01-T02-Q1"]');
 await expect(check.getByText('solo cuenta cuando termines de leer',{exact:false})).toBeVisible();
 await check.getByRole('radio',{name:c01.cards[1].checks[0].options[1].text}).check();
 await check.getByRole('button',{name:'Comprobar'}).click();
 await expect(check.getByRole('status')).toContainText('Revisa este punto');
 await expect(check.getByRole('status')).toContainText(keys['FND-W01-C01-T02-Q1'].feedback.b);
 await check.getByRole('button',{name:'Reintentar'}).click();
 await check.getByRole('radio',{name:c01.cards[1].checks[0].options[0].text}).check();
 await check.getByRole('button',{name:'Comprobar'}).click();
 await expect(check.getByRole('status')).toContainText('Termina la lectura');
 expect((await local(page)).foundationChecks).toBeUndefined();
 await readCard(page);
 await expect(page.getByText('✓ Lectura de la tarjeta registrada')).toBeVisible();
 await check.getByRole('button',{name:'Repetir'}).click();
 await check.getByRole('radio',{name:c01.cards[1].checks[0].options[0].text}).check();
 await check.getByRole('button',{name:'Comprobar'}).click();
 await expect(check.getByText('✓ Correcto',{exact:false})).toBeVisible();
 await expect.poll(async()=>(await local(page)).foundationChecks).toEqual({'FND-W01-C01-T02-Q1':true});
 const state=await local(page);expect(state.foundationCards).toEqual({'FND-W01-C01-T02':true});expect(state.weeks).toEqual([]);
 await page.screenshot({path:testInfo.outputPath('foundation-card-desktop.png'),fullPage:true});
});

test('formative activity and chapter pages never change academic progress; mobile has no horizontal overflow',async({page},testInfo)=>{
 await page.goto('/study/1#FND-W01-C01-activity');
 const items=page.locator('.foundation-activity-item');await expect(items).toHaveCount(6);
 for(const [i,item] of c01.activity!.items.entries())for(const axis of c01.activity!.axes)await items.nth(i).getByLabel(axis.label).selectOption(item.answers[axis.id as keyof typeof item.answers]);
 await page.getByRole('button',{name:'Comprobar clasificación'}).click();
 await expect(page.locator('.foundation-axes small.good')).toHaveCount(18);
 for(const id of ['FND-W01-C01','FND-W01-C01-case','FND-W01-C01-map','FND-W01-C01-apply','FND-W01-C01-transfer','FND-W01-C01-closing']){
  await page.goto(`/study/1#${id}`);await expect(page.locator('[data-study-step]')).toHaveAttribute('data-study-step',id);
 }
 await expect(page.getByText('Minitests: 0/9 correctos',{exact:false})).toBeVisible();
 const state=await local(page);expect(state.foundationCards).toBeUndefined();expect(state.foundationChecks).toBeUndefined();
 await page.setViewportSize({width:320,height:740});
 for(const id of ['FND-W01-C01-T01','FND-W01-C01-activity','FND-W01-C01-map']){
  await page.goto(`/study/1#${id}`);await expect(page.locator('[data-study-step]')).toHaveAttribute('data-study-step',id);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),id).toBe(true);
 }
 await page.screenshot({path:testInfo.outputPath('foundation-mobile.png'),fullPage:true});
});

test('the Fundamentos course lists the two new weeks and no module evaluation',async({page})=>{
 await page.goto('/modules/fundamentos');await expect(page).toHaveURL(/\/courses\/fundamentos$/);
 await expect(page.getByRole('link',{name:/Tipos, enfoques, niveles y pirámide de pruebas/})).toHaveAttribute('href','/study/1');
 await expect(page.getByRole('link',{name:/Principios, clasificaciones, BDD y release/})).toHaveAttribute('href','/study/2');
 await expect(page.locator('#module-quiz')).toHaveCount(0);await expect(page.locator('a[href$="#self-check"]')).toHaveCount(0);
});

test('state balloons open by hover, keyboard and tap, one at a time, and never change progress',async({page})=>{
 await page.goto('/study/1#FND-W01-C03-apply');
 const nodes=page.locator('.state-node');await expect(nodes).toHaveCount(3);
 const panel=page.locator('.state-balloon');
 await nodes.nth(1).hover();await expect(panel).toBeVisible();await expect(panel).toContainText('Ejecutar intercambio');await expect(panel).toContainText('Traza anonimizada');
 await panel.hover();await page.waitForTimeout(500);await expect(panel).toBeVisible();
 await nodes.nth(0).focus();await page.keyboard.press('Enter');await expect(nodes.nth(0)).toHaveAttribute('aria-expanded','true');await expect(page.locator('.state-node[aria-expanded="true"]')).toHaveCount(1);
 await page.keyboard.press('ArrowRight');await expect(nodes.nth(1)).toBeFocused();await expect(panel).toContainText('Ejecutar intercambio');
 await page.keyboard.press('Escape');await expect(panel).toBeHidden();await expect(nodes.nth(1)).toBeFocused();
 await nodes.nth(2).click();await expect(panel).toContainText('Evaluar recuperación');await nodes.nth(2).click();await expect(panel).toBeHidden();
 const state=await local(page);expect(state.foundationCards).toBeUndefined();expect(state.foundationChecks).toBeUndefined();expect(state.weeks||[]).toEqual([]);
 await page.goto('/study/1#FND-W01-C03-map');await expect(page.locator('.foundation-diagram .rel-pairs>li')).toHaveCount(5);await expect(page.locator('.foundation-diagram img')).toHaveCount(0);
 expect((await page.request.get('/fundamentos/diagrams/FND-C03-D1.svg')).status()).toBe(200);
});

test('reduced motion presents every state as a list',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/study/2#FND-W02-C08-apply');
 await expect(page.locator('.state-balloons-list>li')).toHaveCount(4);await expect(page.locator('.state-balloons-flow')).toBeHidden();
});

test('course views drop module evaluation; other modules close with a test in their last week',async({page})=>{
 for(const id of ['fundamentos','manual','herramientas','typescript','playwright','arquitectura']){
  await page.goto(`/modules/${id}`);await expect(page).toHaveURL(new RegExp(`/courses/${id}$`));await expect(page.getByRole('heading',{level:1})).toBeVisible();
  await expect(page.getByText('OBJETIVO DEL MÓDULO')).toHaveCount(0);await expect(page.getByText('Evaluación del curso')).toHaveCount(0);
  await expect(page.locator('#module-quiz')).toHaveCount(0);
  // Cursos aún «En construcción» muestran el aviso; los publicados, su test de cierre en la última semana.
  const soon=await page.getByRole('heading',{name:'En construcción'}).count();
  await expect(page.getByRole('link',{name:'Test de cierre del curso ↗'})).toHaveCount(id==='fundamentos'||soon?0:1);
 }
 await page.goto('/study/6#closing-test');await expect(page.locator('#closing-test').getByText('TEST DE CIERRE DEL CURSO')).toBeVisible();
});

test('MariBug suggests questions about the card in focus and follows the reading without revealing minitest answers',async({page})=>{
 await page.goto('/study/1#FND-W01-C01-T02');
 await page.getByRole('button',{name:'MariBug',exact:true}).click();
 const hints=page.getByRole('group',{name:'Preguntas sobre lo que estás leyendo'});
 await expect(hints.getByRole('button')).toHaveCount(4);
 await expect(page.locator('.qa-focused-context>p').first()).toHaveText(`Semana 1 · ${c01.cards[1].title}`);
 await page.getByRole('navigation',{name:'Navegación por tarjetas'}).getByRole('button',{name:'Siguiente →'}).click();
 await expect(page.locator('.qa-focused-context>p').first()).toHaveText(`Semana 1 · ${c01.cards[2].title}`);
 await expect(hints).toContainText('Inicia sesión para enviarlas a MariBug');
 const text=await hints.innerText();for(const key of Object.values(keys))for(const feedback of Object.values(key.feedback))expect(text).not.toContain(feedback);
});

test('level pyramid: hovering or pressing a role shows that level detail without changing progress',async({page})=>{
 await page.goto('/study/1#FND-W01-C03');
 const map=page.locator('.levels-map').first(),detail=map.locator('.levels-detail');
 await expect(detail).toContainText('Pasa el puntero');
 const roles=map.locator('button.levels-roles');await expect(roles).toHaveCount(5);
 await roles.nth(2).hover();await expect(detail).toContainText('Sistema');await expect(map.locator('.levels-row.is-active')).toHaveCount(1);
 await roles.nth(0).click();await page.mouse.move(0,0);await expect(detail).toContainText('Aceptación');await expect(roles.nth(0)).toHaveAttribute('aria-expanded','true');
 await detail.getByRole('button',{name:'Cerrar ✕'}).click();await expect(detail).toContainText('Pasa el puntero');
 await map.locator('button.levels-band').nth(4).focus();await expect(detail).toContainText('Componente');await page.keyboard.press('Escape');
 const state=await local(page);expect(state.foundationCards).toBeUndefined();expect(state.weeks||[]).toEqual([]);
});
