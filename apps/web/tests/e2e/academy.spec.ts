import {test,expect} from '@playwright/test';
test('dashboard, navegación y contenido de estudio',async({page})=>{
 await page.goto('/');
 await expect(page.getByRole('heading',{name:/Domina el testing/i})).toBeVisible();
 await page.goto('/modules');
 await expect(page.getByRole('heading',{name:/Tu ruta, paso a paso/})).toBeVisible();
 await page.getByRole('link',{name:/Fundamentos del Testing/}).first().click();
 await expect(page.getByRole('heading',{name:/Fundamentos del Testing/})).toBeVisible();
 await page.getByRole('link',{name:/Mentalidad QA y ciclo de vida/}).click();
 await expect(page.getByRole('heading',{name:/Mentalidad QA y ciclo de vida/})).toBeVisible();
});
test('API permite lectura de módulos y calificación',async({request})=>{
 const modules=await request.get('/api/v1/modules');expect(modules.ok()).toBeTruthy();
 expect((await modules.json()).data).toHaveLength(8);
 const bad=await request.post('/api/v1/quizzes/fundamentos/grade',{data:{answers:[-2]}});
 expect(bad.status()).toBe(400);
});
test('marca lecturas y mantiene progreso en el navegador',async({page})=>{
 await page.goto('/study/1');
 const reading=page.getByLabel('He estudiado esta clase');await reading.check();
 await page.reload();await expect(reading).toBeChecked();
});
