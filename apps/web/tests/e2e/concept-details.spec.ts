import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

test.beforeEach(async({page})=>{await page.route('**/api/v1/auth/me',route=>route.fulfill({status:401,json:{message:'No autenticado'}}));await page.emulateMedia({reducedMotion:'reduce'})});

test('focused explanations remain readable without demonstrations or floating details',async({page},info)=>{
 await page.goto('/study/3?view=focused#chapter-0--concept-w3-s0-c1');
 await expect(page.locator('[data-study-step]')).toHaveAttribute('data-study-step','chapter-0--concept-w3-s0-c1',{timeout:15000});
 await expect(page.locator('[data-reading-verified]')).toHaveAttribute('data-reading-verified','true');
 const card=page.locator('.reading-source .reading-concept');
 await expect(card.locator('.concept-example')).toHaveCount(1);
 await expect(card.locator('.concept-demo')).toHaveCount(0);
 await card.hover();await page.mouse.wheel(0,200);
 await expect(page.locator('[data-concept-detail-open],[popover]')).toHaveCount(0);
 await expect(page.locator('[data-reading-blueprint] [id]')).toHaveCount(0);
 await expect(page.locator('[data-reading-verified]')).toHaveAttribute('data-reading-verified','true');
 await page.screenshot({path:info.outputPath('sequence-without-balloon.png')});
});

test('lesson download preserves full explanations and examples',async({page})=>{
 await page.goto('/study/3?view=focused#chapter-0--intro');
 const pending=page.waitForEvent('download');await page.getByRole('button',{name:/Descargar clase/}).click();
 const file=await(await pending).path(),text=await readFile(file!,'utf8');
 expect(text).toContain('# Semana 3 · Historias de usuario y criterios de aceptación');
 expect(text).toContain('### Rol y necesidad de usuario');expect(text).toContain('**Ejemplo aplicado**');expect(text).toContain('Ejemplo trabajado · acceso a una plataforma');
});
