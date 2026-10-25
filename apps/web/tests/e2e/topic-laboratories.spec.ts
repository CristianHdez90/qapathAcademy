import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.route('**/api/v1/auth/me',r=>r.fulfill({status:401,json:{message:'No autenticado'}}))});
test('week 7 keeps Postman and executes SQL inside its support laboratory',async({page})=>{
 test.setTimeout(90000);await page.goto('/practice/7');const lab=page.locator('.activity-lab');
 await expect(lab.locator(':scope > summary')).toHaveText('Laboratorio de apoyo para esta actividad · QA Store');
 await expect(lab.getByRole('button',{name:'Colección de Postman',exact:false})).toBeVisible();
 await lab.getByRole('button',{name:'Base de datos SQL',exact:true}).click();await lab.getByRole('textbox',{name:'Código de la práctica'}).fill('SELECT name FROM qa_training_customers ORDER BY id');await lab.getByRole('button',{name:'Ejecutar práctica',exact:true}).click();await expect(lab.getByLabel('Resultado de la ejecución')).toContainText('Luis Demo',{timeout:40000});
 await expect(lab.getByRole('button',{name:'Comandos Git',exact:true})).toHaveCount(0);
});
test('foundation workbooks and risk activities match their topic',async({page})=>{
 await page.goto('/practice/1');await expect(page.getByRole('region',{name:'Cotizador QA Store'})).toHaveCount(0);await expect(page.getByRole('region',{name:'Tabla de casos de prueba'})).toBeVisible();
 await page.goto('/practice/2');await expect(page.getByRole('heading',{name:'¿Qué probarías primero?',exact:true})).toBeVisible();await page.getByRole('button',{name:'Validar mi estrategia',exact:true}).click();await expect(page.getByRole('status',{name:'Resultado de la misión de riesgos'})).toContainText('Selecciona dos riesgos');
});

test('manual QA labs execute acceptance rules, boundaries and bug transitions',async({page})=>{
 await page.goto('/practice/3');await page.getByLabel('Título del Scenario',{exact:true}).fill('Acceder a los pedidos de mi cuenta');await page.getByRole('group',{name:'Pasos para construir el escenario'}).getByRole('button',{name:/^2\. Given/}).click();await page.getByLabel('Given · contexto inicial',{exact:true}).selectOption('active-valid');await page.getByRole('group',{name:'Pasos para construir el escenario'}).getByRole('button',{name:/^3\. When/}).click();await page.getByLabel('When · acción de negocio',{exact:true}).selectOption('request-access');await page.getByRole('group',{name:'Pasos para construir el escenario'}).getByRole('button',{name:/^4\. Then/}).click();await page.getByLabel('Then · resultado observable',{exact:true}).selectOption('show-orders');await page.getByRole('button',{name:'Ejecutar y validar escenario',exact:true}).click();await expect(page.getByRole('status',{name:'Resultado de validación Gherkin'})).toContainText('Escenario correcto para la HU.');
 await page.goto('/practice/5');await expect(page.getByRole('heading',{name:'Detecta, reporta y confirma la corrección',exact:true})).toBeVisible();
 await page.goto('/practice/6');await page.getByRole('group',{name:'Pasos de la misión de Sprint'}).getByRole('button').nth(1).click();await page.getByRole('button',{name:'Comprobar mis métricas',exact:true}).click();await expect(page.getByLabel('Métricas calculadas')).toContainText('19/25 (76 %)');
});
test('locators and fixtures have their own interactive lab and mobile layout',async({page})=>{
 test.setTimeout(60000);await page.goto('/practice/14');await expect(page.frameLocator('iframe[title="Aplicación para locators y fixtures"]').getByLabel('Producto ficticio')).toBeAttached();await page.getByRole('button',{name:'Inspeccionar locator'}).click();await expect(page.getByLabel('Resultado de automatización temática')).toContainText('Coincidencias obtenidas: 1');
 await page.goto('/practice/17');await expect(page.frameLocator('iframe[title="Aplicación para Page Object"]').getByLabel('Producto ficticio')).toBeAttached();await page.getByLabel('Cantidad del Page Object').fill('3');await page.getByLabel('Esperado del test POM').fill('105000 COP');await page.getByRole('button',{name:'Ejecutar operación del Page Object'}).click();await expect(page.getByLabel('Resultado del Page Object')).toContainText('Resultado obtenido: 105000 COP');
 await page.goto('/practice/18');await page.getByRole('button',{name:'Ejecutar datasets aislados'}).click();await expect(page.getByLabel('Resultado de automatización temática')).toContainText('Dataset 2 · formulario nuevo · Aprobado',{timeout:20000});
 await page.setViewportSize({width:320,height:800});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
