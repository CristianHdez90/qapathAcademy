import {test,expect} from '@playwright/test';
/** SPEC-UX-310 · Home de cursos configurable: lectura pública, RBAC y diseño responsive con el tema publicado. */
test('public appearance returns only the published theme and admin endpoints require ADMIN',async({request})=>{
 const published=await (await request.get('/api/v1/appearance/home')).json();
 expect(published.data.config.preset).toMatch(/^[a-z]+(-[a-z]+)*$/);
 expect(JSON.stringify(published.data)).not.toMatch(/draft/i);
 expect((await request.get('/api/v1/admin/appearance/home')).status()).toBe(401);
 expect((await request.patch('/api/v1/admin/appearance/home/draft',{data:{expectedRevision:0,config:published.data.config}})).status()).toBeGreaterThanOrEqual(401);
 expect((await request.post('/api/v1/admin/appearance/home/publish',{data:{expectedRevision:0}})).status()).toBeGreaterThanOrEqual(401);
});
test('home keeps courses first, works by keyboard and fits 320–1440 px',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('/');
 await expect(page.locator('.course-card').first()).toBeVisible();
 expect(await page.locator('.course-card').first().evaluate(node=>node.getBoundingClientRect().top)).toBeLessThan(450);
 const search=page.locator('#catalog-search');await search.focus();await page.keyboard.type('Playwright');
 await expect(page.locator('.course-card')).toHaveCount(1);await page.getByRole('button',{name:'Borrar búsqueda'}).click();
 const chip=page.getByRole('group',{name:'Filtrar por área'}).getByRole('button').nth(1);await chip.focus();await page.keyboard.press('Enter');
 await expect(chip).toHaveAttribute('aria-pressed','true');
 for(const [width,height] of [[320,720],[390,844],[834,1112],[1280,800],[1440,900]]){
  await page.setViewportSize({width,height});await page.goto('/');await expect(page.locator('.course-card').first()).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${width}px`).toBe(true);
 }
});
test('reduced motion keeps every card readable',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 await expect(page.locator('.course-card').first()).toBeVisible();await expect(page.locator('.course-card h3').first()).not.toBeEmpty();
});
