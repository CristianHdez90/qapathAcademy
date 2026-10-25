import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{await page.route('**/api/v1/auth/me',r=>r.fulfill({status:401,json:{message:'No autenticado'}}))});
test('all practices expose only four main sections in the requested order',async({page})=>{
 test.setTimeout(120000);
 for(let week=1;week<=24;week++){
  await page.goto(`/practice/${week}`);await expect(page.locator('.activity-lab')).toBeVisible();
  const blocks=page.locator('.practice-activity > .activity-section');await expect(blocks).toHaveCount(4);
  await expect(blocks.nth(0)).toHaveClass(/activity-lab/);
  await expect(blocks.nth(1).locator(':scope > h2')).toHaveText('Prepara tu actividad');
  await expect(blocks.nth(2).locator(':scope > h2')).toHaveText('Instrucciones de esta semana');
  await expect(blocks.nth(3).locator(':scope > h2')).toHaveText('Archivos para trabajar con tu herramienta');
  await expect(blocks.nth(1).getByRole('link',{name:'Descargar kit de apoyo',exact:true})).toHaveAttribute('href','/practice/qapath-practice-kit.zip');
  if(week===17)await expect(blocks.nth(0).locator(':scope > summary')).toHaveText('Laboratorio interactivo · Page Objects con responsabilidades claras');
 }
});
test('matrix and evidence remain available inside the first section',async({page})=>{
 await page.goto('/practice/4');const lab=page.locator('.activity-lab');
 await lab.getByRole('button',{name:'Ejecutar actividad del tema',exact:true}).click();
 await expect(lab.getByLabel('Resultado de la actividad del tema')).toContainText('Regla: entre 8 y 20 caracteres');
 await expect(lab.getByLabel('Caso 1 · Título',{exact:true})).toBeVisible();
 await lab.getByText('Guardar y revisar evidencia',{exact:true}).click();
 await lab.getByRole('button',{name:'Guardar evidencia de esta actividad',exact:true}).click();
 await expect(lab.getByText('✓ Guardado en este navegador',{exact:true})).toBeVisible();
});
