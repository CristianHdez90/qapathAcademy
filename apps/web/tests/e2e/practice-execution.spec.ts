import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.route('**/api/v1/auth/me',r=>r.fulfill({status:401,json:{message:'No autenticado'}}))});
test('all modules preserve preparation, instructions and kit with a matching executor',async({request})=>{
 for(let week=1;week<=24;week++){const response=await request.get(`/practice/${week}`);const html=await response.text();expect(response.status()).toBe(200);for(const label of ['Prepara tu actividad','Instrucciones de esta semana','Descargar kit de apoyo','Laboratorio interactivo'])expect(html).toContain(label)}
});
test('JavaScript executes assertions, rejects failures and stops infinite loops',async({page})=>{
 await page.goto('/practice/9');const editor=page.getByRole('textbox',{name:'Código de la práctica'}),run=page.getByRole('button',{name:'Ejecutar práctica',exact:true}),result=page.getByLabel('Resultado de la ejecución');
 await run.click();await expect(result).toContainText('Cotización básica');await expect(page.getByText('Ejecución finalizada correctamente.',{exact:true})).toBeVisible();
 await editor.fill("assert(1===2,'Esperaba dos valores iguales')");await run.click();await expect(result).toContainText('Esperaba dos valores iguales');await expect(page.getByText('La ejecución detectó un fallo. Revisa el esperado y el obtenido.',{exact:true})).toBeVisible();
 await editor.fill('while(true){}');await run.click();await expect(result).toContainText('límite de 3 segundos');
 await editor.fill("assert(true,'Recuperado después del límite')");await run.click();await expect(result).toContainText('Recuperado después del límite');
 await page.getByText('Guardar y revisar evidencia',{exact:true}).click();await page.getByRole('button',{name:'Guardar evidencia de esta actividad',exact:true}).click();await expect(page.getByText('✓ Guardado en este navegador',{exact:true})).toBeVisible();await page.reload();await expect(editor).toHaveValue("assert(true,'Recuperado después del límite')");
});
test('TypeScript and asynchronous examples run; code cannot reach the network',async({page})=>{
 for(const week of [11,12]){await page.goto(`/practice/${week}`);await page.getByRole('button',{name:'Ejecutar práctica',exact:true}).click();await expect(page.getByText('Ejecución finalizada correctamente.',{exact:true})).toBeVisible()}
 await page.goto('/practice/9');let requests=0;await page.route('**/should-not-be-reached',r=>{requests++;return r.fulfill({json:{}})});
 await page.getByRole('textbox',{name:'Código de la práctica'}).fill("await fetch('http://127.0.0.1:3000/should-not-be-reached')");await page.getByRole('button',{name:'Ejecutar práctica',exact:true}).click();await expect(page.getByText('La ejecución detectó un fallo. Revisa el esperado y el obtenido.',{exact:true})).toBeVisible();expect(requests).toBe(0);
});
test('PostgreSQL executes joins on synthetic data and reports invalid SQL',async({page})=>{
 test.setTimeout(90000);await page.goto('/practice/8');const run=page.getByRole('button',{name:'Ejecutar práctica',exact:true});
 await page.getByRole('textbox',{name:'Código de la práctica'}).fill("SELECT c.name FROM qa_training_customers c LEFT JOIN qa_training_orders o ON o.customer_id=c.id WHERE o.id IS NULL");await run.click();await expect(page.getByLabel('Resultado de la ejecución')).toContainText('Luis Demo',{timeout:40000});
 await page.getByRole('textbox',{name:'Código de la práctica'}).fill('SELECT missing FROM qa_training_customers');await run.click();await expect(page.getByLabel('Resultado de la ejecución')).toContainText('does not exist',{timeout:40000});
});
test('configured UI scenario acts on QA Store, detects defects and exports spec',async({page})=>{
 await page.goto('/practice/13');const preview=page.frameLocator('iframe[title="Vista de ejecución QA Store"]');await expect(preview.getByLabel('Producto ficticio')).toBeAttached();
 await page.getByLabel('Producto de la ejecución',{exact:true}).selectOption('pro');await page.getByLabel('Cantidad de la ejecución',{exact:true}).fill('2');await page.getByLabel('Esperado de la ejecución',{exact:true}).fill('150000 COP');await page.getByRole('button',{name:'Ejecutar práctica',exact:true}).click();await expect(page.getByLabel('Resultado de la ejecución')).toContainText('Resultado obtenido: 150000 COP');
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Descargar spec Playwright configurado'}).click();expect((await download).suggestedFilename()).toBe('configured-quote.spec.ts');
 await page.getByLabel('Esperado de la ejecución',{exact:true}).fill('1 COP');await page.getByRole('button',{name:'Ejecutar práctica',exact:true}).click();await expect(page.getByText('La ejecución detectó un fallo. Revisa el esperado y el obtenido.',{exact:true})).toBeVisible();
 await page.setViewportSize({width:320,height:800});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('HTTP and pipeline run in platform without moving Postman to other modules',async({page})=>{
 await page.goto('/practice/19');await page.getByLabel('Método de la solicitud').selectOption('GET');await page.getByLabel('Endpoint del sandbox').selectOption('/api/v1/practice/status/204');await page.getByLabel('Status esperado',{exact:true}).fill('204');await page.getByRole('button',{name:'Ejecutar práctica',exact:true}).click();await expect(page.getByLabel('Resultado de la ejecución')).toContainText('Obtenido: HTTP 204');
 await page.goto('/practice/21');await page.getByLabel('Etapas de la suite').selectOption('unit');await page.getByLabel('Repeticiones de la suite').fill('2');await page.getByRole('button',{name:'Ejecutar práctica',exact:true}).click();await expect(page.getByLabel('Resultado de la ejecución')).toContainText('Comprobaciones aprobadas: 2/2');await expect(page.locator('body')).not.toContainText('Postman');
});
