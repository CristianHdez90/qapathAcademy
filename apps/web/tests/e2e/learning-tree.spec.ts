import {test,expect} from '@playwright/test';
import modules from '../../src/features/navigation/learning-tree.json';
test.beforeEach(async({page})=>{await page.route('**/api/v1/auth/me',r=>r.fulfill({status:401,json:{message:'No autenticado'}}))});
test('desktop tree reaches chapters and the single practice entry without laboratories',async({page},testInfo)=>{
 await page.goto('/study/3');const nav=page.getByRole('navigation',{name:'Navegación principal',exact:true});
 await expect(nav.getByText('CONTENIDO DE ESTUDIO',{exact:true}).filter({visible:true}).first()).toBeVisible();
 await expect(nav.locator('a[href="/study/1#FND-W01-C01-T01"]')).toHaveCount(1);await expect(nav.locator('a[href="/study/2#FND-W02-C08-T09"]')).toHaveCount(1);await expect(nav.locator('a[href="/study/1#self-check"]')).toHaveCount(0);
 const chapter=nav.locator('a[href="/study/3#chapter-1"]');await chapter.click();await expect(page).toHaveURL(/study\/3#chapter-1$/);await expect(page.locator('#chapter-1')).toBeInViewport();await expect(chapter).toHaveAttribute('aria-current','location');
 await nav.locator('a[href="/study/3#practical-exercise"]').click();await expect(page.locator('#practical-exercise')).toHaveAttribute('open','');await expect(nav.getByRole('link',{name:'Laboratorio',exact:true})).toHaveCount(0);
 await page.goto('/modules/fundamentos');await expect(page.getByRole('heading',{name:'Detective de defectos',exact:true})).toHaveCount(0);await expect(page.getByRole('heading',{name:'Evaluación del curso',exact:true})).toHaveCount(0);await expect(page.locator('.module-chapters li')).toHaveCount(8);
 await page.goto('/study/3');await nav.getByText('Semana 3',{exact:true}).locator('..').press('Enter');await expect(nav.locator('a[href="/study/3#self-check"]')).not.toBeVisible();await nav.getByText('Semana 3',{exact:true}).locator('..').press('Enter');await expect(nav.locator('a[href="/study/3#self-check"]')).toBeVisible();
 await page.screenshot({path:testInfo.outputPath('tree-desktop.png')});
});
test('all 24 weeks and chapter links use real targets',async({page})=>{
 test.setTimeout(120000);
 for(const courseModule of modules)for(const week of courseModule.weeks){await page.goto(`/study/${week.id}#practical-exercise`);await expect(page.locator('#practical-exercise')).toHaveAttribute('open','');if(week.foundation){for(const chapter of week.foundation){await page.goto(`/study/${week.id}#${chapter.anchor}`);await expect(page.locator('[data-study-step]')).toHaveAttribute('data-study-step',chapter.anchor)}continue}for(let i=0;i<week.chapters.length;i++)await expect(page.locator(`#chapter-${i}`)).toHaveCount(1);await expect(page.locator('#practice')).toHaveCount(0);await expect(page.locator('#self-check')).toHaveCount(1)}
});
test('mobile route dialog scrolls, closes on navigation and restores focus after Escape',async({page},testInfo)=>{
 await page.setViewportSize({width:375,height:700});await page.goto('/study/3');const trigger=page.getByRole('button',{name:'Ruta de 8 módulos',exact:true});await trigger.click();const dialog=page.getByRole('dialog',{name:'Tu ruta de aprendizaje'});await expect(dialog).toBeVisible();await expect(dialog.getByText('Semana 3',{exact:true})).toBeVisible();
 await dialog.locator('a[href="/study/3#self-check"]').click();await expect(dialog).toHaveCount(0);await expect(page).toHaveURL(/study\/3#self-check$/);await expect(page.locator('#self-check')).toBeInViewport();
 await trigger.click();await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(trigger).toBeFocused();
 await trigger.click();await dialog.getByText('Practica con herramientas reales',{exact:true}).filter({visible:true}).first().click();await dialog.getByRole('link',{name:'Ejercicio · semana 3',exact:true}).click();await expect(page).toHaveURL(/practice\/3$/);await expect(dialog).toHaveCount(0);
 await trigger.click();await expect(dialog.getByRole('button',{name:'Cerrar ruta de aprendizaje',exact:true})).toBeInViewport();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:testInfo.outputPath('tree-mobile.png')});
});
