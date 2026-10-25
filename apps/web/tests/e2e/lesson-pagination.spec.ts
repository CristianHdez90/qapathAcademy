import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.route('**/api/v1/auth/me',r=>r.fulfill({status:401,json:{message:'No autenticado'}}))});
test('one activity at a time, next/previous boundaries, direct links and browser history',async({page})=>{
 await page.goto('/study/1');const pager=page.getByRole('navigation',{name:'Navegación paginada de la clase',exact:true});const picker=pager.getByLabel('Ir a un apartado');
 await expect(pager.getByRole('button',{name:'← Anterior',exact:true})).toBeDisabled();await expect(page.locator('#chapter-0')).toBeVisible();await expect(page.locator('#chapter-1')).not.toBeVisible();
 const ids=await picker.locator('option').evaluateAll(options=>options.map(option=>(option as HTMLOptionElement).value));
 for(let i=1;i<ids.length;i++){await page.getByRole('navigation',{name:'Continuar en la clase',exact:true}).getByRole('button',{name:'Siguiente →',exact:true}).click();await expect(picker).toHaveValue(ids[i]);await expect(page.locator('#'+ids[i])).toBeVisible();await expect(page.locator('#'+ids[i-1])).not.toBeVisible()}
 await expect(pager.getByRole('button',{name:'Siguiente →',exact:true})).toBeDisabled();
 await pager.getByRole('button',{name:'← Anterior',exact:true}).click();await expect(picker).toHaveValue('study-notes');await page.goBack();await expect(picker).toHaveValue('study-resources');
 await page.goto('/study/1#practical-exercise');await expect(picker).toHaveValue('practical-exercise');await expect(page.getByRole('link',{name:'Abrir actividad de la semana 1',exact:false})).toBeVisible();
 const tree=page.getByRole('navigation',{name:'Navegación principal',exact:true});await tree.getByRole('link',{name:'CAPÍTULO 02',exact:false}).first().click();await expect(picker).toHaveValue('chapter-1');await expect(page.locator('#chapter-1')).toBeInViewport();await expect(page.locator('#practical-exercise')).not.toBeVisible();
 await page.reload();await expect(picker).toHaveValue('chapter-1');
});
test('drafts and selected answers survive pagination, mobile layout fits and hidden chapters are not completed',async({page},testInfo)=>{
 await page.clock.install();await page.goto('/study/1#self-check');await page.bringToFront();await page.clock.runFor(5000);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('qapath-academy-v2')||'{}').readingSections||{})).toEqual({});
 const picker=page.getByLabel('Ir a un apartado');await picker.selectOption('study-notes');const field=page.getByLabel('Mis notas',{exact:true});await field.fill('Borrador pendiente de enviar que debe conservarse al navegar.');
 await picker.selectOption('self-check');const answer=page.locator('#self-check').getByRole('button',{name:'Que no quedan defectos',exact:true});await answer.click();await expect(answer).toHaveAttribute('aria-pressed','true');
 await picker.selectOption('study-notes');await expect(field).toHaveValue('Borrador pendiente de enviar que debe conservarse al navegar.');await picker.selectOption('self-check');await expect(answer).toHaveAttribute('aria-pressed','true');
 await page.setViewportSize({width:375,height:750});await picker.selectOption('chapter-0');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:testInfo.outputPath('lesson-pagination-mobile.png')});
});
