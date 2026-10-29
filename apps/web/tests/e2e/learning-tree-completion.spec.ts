import {test,expect} from '@playwright/test';
test('tree checks use saved completion, never branch expansion or active navigation',async({page})=>{
 await page.route('**/api/v1/auth/me',r=>r.fulfill({status:401,json:{message:'No autenticado'}}));
 await page.addInitScript(()=>localStorage.setItem('qapath-academy-v2',JSON.stringify({version:2,weeks:[],readingSections:{'3':[0]},lessonChecks:[],evidence:{},quizzes:{manual:0}})));
 await page.goto('/study/3');const nav=page.getByRole('navigation',{name:'Navegación principal',exact:true});
 const first=nav.locator('a[href="/study/3#chapter-0"]'),second=nav.locator('a[href="/study/3#chapter-1"]');
 await expect(first.getByLabel('Completado',{exact:true})).toHaveCount(1);await expect(second.getByLabel('Completado',{exact:true})).toHaveCount(0);
 await second.click();await expect(second).toHaveAttribute('aria-current','location');await expect(second.getByLabel('Completado',{exact:true})).toHaveCount(0);
 const reading=nav.getByText('Lectura',{exact:true}).first().locator('..');await expect(reading.getByLabel('Completado',{exact:true})).toHaveCount(0);
 await reading.press('Enter');await reading.press('Enter');await expect(reading.getByLabel('Completado',{exact:true})).toHaveCount(0);
 await expect(nav.locator('a[href="/study/3#self-check"]').getByLabel('Completado',{exact:true})).toHaveCount(0);
 const closing=nav.locator('a[href="/study/6#closing-test"]');await expect(closing).toHaveCount(1);await expect(closing.getByLabel('Completado',{exact:true})).toHaveCount(0);
 await expect(nav.locator('a[href*="#module-quiz"]')).toHaveCount(0);
});
