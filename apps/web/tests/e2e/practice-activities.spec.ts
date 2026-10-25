import {test,expect} from '@playwright/test';
import {activityProfiles} from '../../src/features/practice/activity-fields';
test.beforeEach(async({page})=>{
 await page.route('**/api/v1/auth/me',r=>r.fulfill({status:401,json:{message:'No autenticado'}}));
});

test('lesson opens its specific activity and preserves week-specific evidence',async({page})=>{
 await page.goto('/study/1#practical-exercise');
 await expect(page.getByRole('heading',{name:'Mentalidad QA y ciclo de vida del software',exact:true})).toBeVisible();
 await expect(page.getByRole('link',{name:'Abrir actividad de la semana 1',exact:false})).toHaveAttribute('href','/practice/1');
 await page.goto('/practice/1');await page.getByText('Guardar y revisar evidencia',{exact:true}).click();
 const wizard=page.locator('.foundation-evidence-wizard');
 await expect(wizard.getByRole('heading',{name:'Tu misión QA: de los casos a la evidencia',exact:true})).toBeVisible();
 await wizard.getByRole('button',{name:'Continuar: explicar mis hallazgos',exact:true}).click();
 await wizard.getByRole('textbox').fill('Reviso CA-01 mediante una partición de equivalencia válida.');
 await wizard.getByRole('button',{name:'Siguiente pregunta →',exact:true}).click();
 await wizard.getByRole('textbox').fill('Antes de ejecutar defino el saldo esperado según la HU.');
 await wizard.getByRole('button',{name:'Siguiente pregunta →',exact:true}).click();
 const observed='Documentaré cualquier diferencia con datos y pasos para reproducirla.';
 await wizard.getByRole('textbox').fill(observed);
 await wizard.getByRole('button',{name:'Revisar mi entrega →',exact:true}).click();
 await wizard.getByRole('button',{name:'Guardar evidencia de esta actividad',exact:true}).click();
 await expect(wizard.getByText('✓ Guardado en este navegador',{exact:true})).toBeVisible();
 await page.reload();await wizard.locator('summary').first().click();await wizard.getByRole('button',{name:'Continuar: explicar mis hallazgos',exact:true}).click();await wizard.getByRole('button',{name:'3. Bugs y retest',exact:true}).click();
 await expect(wizard.getByRole('textbox')).toHaveValue(observed);
 await page.goto('/practice/5');await page.getByText('Guardar y revisar evidencia',{exact:true}).click();await expect(page.getByRole('heading',{name:'Tu bitácora del bug: del hallazgo al cierre',exact:true})).toBeVisible();
 await page.locator('.bug-evidence-wizard').getByRole('button',{name:'Continuar: explicar mis decisiones',exact:true}).click();await expect(page.getByLabel('Título y descripción del error',{exact:true})).toHaveValue('');

 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('qapath-academy-v2')||'{}'));
 expect(JSON.parse(stored.evidence['exercise:1']).fields[2]).toBe(observed);expect(stored.evidence['exercise:5']).toBeUndefined();
});

test('SQL and delivery activities have their own tools, and mobile form fits',async({page},testInfo)=>{
 await page.goto('/practice/8');await page.getByText('Guardar y revisar evidencia',{exact:true}).click();
 await expect(page.getByRole('heading',{name:'Consultas SQL y entrega con Git',exact:true})).toBeVisible();
 await expect(page.getByLabel('Consultas SQL ejecutadas en la base local de práctica',{exact:true})).toBeVisible();
 await expect(page.getByRole('region',{name:'Cotizador QA Store'})).toHaveCount(0);
 await page.setViewportSize({width:320,height:740});
 await page.getByRole('heading',{name:'Consultas SQL y entrega con Git',exact:true}).scrollIntoViewIfNeeded();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:testInfo.outputPath('practice-sql-mobile.png')});
 await page.goto('/practice/24');await page.getByText('Guardar y revisar evidencia',{exact:true}).click();await expect(page.getByRole('heading',{name:'Entrega profesional y demo',exact:true})).toBeVisible();
 const response=await page.goto('/practice/25');expect(response?.status()).toBe(404);
});

test('all 24 activity routes expose the matching workspace',async({request})=>{
 for(let week=1;week<=24;week++){
  const response=await request.get(`/practice/${week}`);expect(response.status(),`week ${week}`).toBe(200);
  expect(await response.text()).toContain(activityProfiles[week].workspace);
 }
});

test('case matrix saves with its activity and exports expected and observed separately',async({page})=>{
 await page.goto('/practice/6');await page.getByText('Guardar y revisar evidencia',{exact:true}).click();
 await page.getByLabel('Caso 1 · Título',{exact:true}).fill('TC-01 Cotización con recogida');
 await page.getByLabel('Caso 1 · Precondiciones',{exact:true}).fill('Producto básico disponible; defecto desactivado.');
 await page.getByLabel('Caso 1 · Pasos · Given / When / Then',{exact:true}).fill('Given cantidad 1; When cotizo; Then total 35000 COP.');
 await page.getByLabel('Caso 1 · Resultado esperado',{exact:true}).fill('35000 COP');
 await page.getByLabel('Caso 1 · Resultado obtenido (observado)',{exact:true}).fill('35000 COP observado al ejecutar en entorno local.');
 await page.getByLabel('Caso 1 · Estado',{exact:true}).selectOption('Aprobado');
 await page.getByRole('button',{name:'Guardar evidencia de esta actividad',exact:true}).click();
 await expect(page.getByText('✓ Guardado en este navegador',{exact:true})).toBeVisible();
 await page.reload();await expect(page.getByLabel('Caso 1 · Resultado esperado',{exact:true})).toHaveValue('35000 COP');
 await expect(page.getByLabel('Caso 1 · Estado',{exact:true})).toHaveValue('Aprobado');
 const pending=page.waitForEvent('download');await page.getByRole('button',{name:'Descargar matriz CSV',exact:true}).click();
 expect((await pending).suggestedFilename()).toBe('matriz-casos-ejecucion.csv');
 await page.setViewportSize({width:320,height:740});await page.getByLabel('Caso 1 · Título',{exact:true}).scrollIntoViewIfNeeded();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.goto('/practice/3');await expect(page.getByLabel('Caso 1 · Título',{exact:true})).toHaveCount(0);
});

test('Postman, SQL and first Playwright file remain available in the matching activity',async({page,request})=>{
 for(const [week,label,path] of [[7,'Colección Postman conservada','/practice/kit/qapath.postman_collection.json'],[8,'SQL ejecutable Q1–Q9','/practice/kit/data/training.sql'],[13,'Primer test Playwright sin abstracciones','/practice/kit/tests/first-quote.spec.ts']] as const){
  await page.goto(`/practice/${week}`);await expect(page.getByRole('link',{name:label,exact:false})).toHaveAttribute('href',path);
  const response=await request.get(path);expect(response.status()).toBe(200);
 }
});

test('Postman practice is only shown in the tools module',async({page})=>{
 for(const week of [1,4,19,23,24]){
  await page.goto(`/practice/${week}`);
  await expect(page.locator('body')).not.toContainText('Postman');
  await expect(page.getByRole('button',{name:'Colección de Postman',exact:false})).toHaveCount(0);
 }
 await page.goto('/practice/7');
 await expect(page.locator('.activity-lab')).toHaveAttribute('open','');
 await expect(page.getByRole('button',{name:'Colección de Postman',exact:false})).toBeVisible();
});
