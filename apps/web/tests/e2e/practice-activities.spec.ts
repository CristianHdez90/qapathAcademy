import {test,expect} from '@playwright/test';
import {activityProfiles} from '../../src/features/practice/activity-fields';
test.beforeEach(async({page})=>{
 await page.route('**/api/v1/auth/me',r=>r.fulfill({status:401,json:{message:'No autenticado'}}));
});

test('lesson opens its specific activity and preserves week-specific evidence',async({page})=>{
 await page.goto('/study/1#practical-exercise');
 await expect(page.getByRole('heading',{name:'Mentalidad QA y ciclo de vida del software',exact:true})).toBeVisible();
 await expect(page.getByRole('link',{name:'Abrir actividad de la semana 1',exact:false})).toHaveAttribute('href','/practice/1');
 await page.goto('/practice/1');
 await expect(page.getByRole('heading',{name:'Escenarios Gherkin y registro de ejecución'})).toBeVisible();
 await page.getByLabel('Escenarios de prueba · Given / When / Then',{exact:true}).fill('Scenario: Cotización básica\nGiven cantidad 1 sin cupón\nWhen solicito cotizar\nThen el total es 35000 COP');
 await page.getByLabel('Resultado esperado por escenario',{exact:true}).fill('Para cantidad 1 con recogida, total esperado de 35000 COP.');
 const observed='Resultado obtenido 35000 COP, estado Passed, fecha 2026-10-24; captura en evidencia local.';
 await page.getByLabel('Resultado obtenido (observado), estado, fecha y evidencia',{exact:true}).fill(observed);
 await page.getByRole('button',{name:'Guardar evidencia de esta actividad',exact:true}).click();
 await expect(page.getByText('✓ Guardado en este navegador',{exact:true})).toBeVisible();
 await page.reload();await expect(page.getByLabel('Resultado obtenido (observado), estado, fecha y evidencia',{exact:true})).toHaveValue(observed);
 await page.goto('/practice/5');await expect(page.getByRole('heading',{name:'Reporte de bug reproducible',exact:true})).toBeVisible();
 await expect(page.getByLabel('Título y descripción del error',{exact:true})).toHaveValue('');
 await expect(page.getByLabel('Resultado esperado',{exact:true})).toBeVisible();await expect(page.getByLabel('Resultado obtenido (observado)',{exact:true})).toBeVisible();
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('qapath-academy-v2')||'{}'));
 expect(JSON.parse(stored.evidence['exercise:1']).fields[2]).toBe(observed);expect(stored.evidence['exercise:5']).toBeUndefined();
});

test('SQL and delivery activities have their own tools, and mobile form fits',async({page},testInfo)=>{
 await page.goto('/practice/8');
 await expect(page.getByRole('heading',{name:'Consultas SQL y entrega con Git',exact:true})).toBeVisible();
 await expect(page.getByLabel('Consultas SQL ejecutadas en la base local de práctica',{exact:true})).toBeVisible();
 await expect(page.getByRole('region',{name:'Cotizador QA Store'})).toHaveCount(0);
 await page.setViewportSize({width:320,height:740});
 await page.getByRole('heading',{name:'Consultas SQL y entrega con Git',exact:true}).scrollIntoViewIfNeeded();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:testInfo.outputPath('practice-sql-mobile.png')});
 await page.goto('/practice/24');await expect(page.getByRole('heading',{name:'Entrega profesional y demo',exact:true})).toBeVisible();
 const response=await page.goto('/practice/25');expect(response?.status()).toBe(404);
});

test('all 24 activity routes expose the matching workspace',async({request})=>{
 for(let week=1;week<=24;week++){
  const response=await request.get(`/practice/${week}`);expect(response.status(),`week ${week}`).toBe(200);
  expect(await response.text()).toContain(activityProfiles[week].workspace);
 }
});
