import {test,expect} from '@playwright/test';
import {foundationExamples} from '../../../../libs/progress/src/domain/foundation-practice';
test('HU, expandable matrix, execution and required technique coverage persist',async({page},testInfo)=>{
 await page.route('**/api/v1/auth/me',r=>r.fulfill({status:401,json:{message:'No autenticado'}}));await page.goto('/practice/1');
 await expect(page.getByRole('article',{name:'Historia de usuario BDD'})).toContainText('CA-04');
 const references=page.getByRole('rowgroup',{name:'Ejemplos diligenciados de solo lectura'});await expect(references.getByRole('row')).toHaveCount(5);await expect(references.locator('input,textarea,select,button')).toHaveCount(0);await expect(references).toContainText('Saldo 150; aceptada');await expect(references).toContainText('REF-TE-01');
 await page.getByText('Escenarios BDD en lenguaje Gherkin',{exact:true}).click();await expect(page.getByText('Feature: Transferir dinero',{exact:false})).toBeVisible();
 await expect(page.getByRole('columnheader',{name:'Pasos de ejecución (acciones numeradas)',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Validar práctica',exact:true}).click();await expect(page.getByText('Práctica completada:',{exact:false})).toHaveCount(0);
 await page.getByRole('button',{name:'Agregar caso de prueba',exact:true}).click();await expect(page.getByLabel('TC-06 · Título',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Eliminar TC-06',exact:true}).click();
 for(const [i,e] of foundationExamples.entries()){
 const id=`TC-${String(i+1).padStart(2,'0')}`;
 await page.getByLabel(`${id} · Criterio`,{exact:true}).selectOption(e.criterion);await expect(page.getByLabel(`${id} · Ejemplo / técnica`,{exact:true})).toBeEnabled();
 for(const [label,value] of [['Título',e.technique],['Precondiciones','Cuenta de entrenamiento preparada'],['Datos de prueba (JSON)',JSON.stringify(e.data)],['Pasos de ejecución (acciones numeradas)',e.steps.map((s,i)=>`${i+1}. ${s}`).join('\n')],['Resultado esperado',e.expected]])await page.getByLabel(`${id} · ${label}`,{exact:true}).fill(value);
 }
 await page.getByRole('button',{name:'Ejecutar todos los casos',exact:true}).click();await expect(page.getByText('Cobertura: 5/5',{exact:false})).toBeVisible();
 await page.getByRole('button',{name:'Validar práctica',exact:true}).click();await expect(page.getByText('Práctica completada:',{exact:false})).toBeVisible();await page.reload();await expect(page.getByText('Práctica completada:',{exact:false})).toBeVisible();
 const wizard=page.locator('.foundation-evidence-wizard');await wizard.locator('summary').first().click();await wizard.getByRole('button',{name:'Guardar mi avance sin reflexión',exact:true}).click();await wizard.getByRole('button',{name:'Editar respuesta 1',exact:true}).click();await wizard.getByRole('textbox').fill('La HU requiere conservar un saldo correcto al transferir.');await wizard.getByRole('button',{name:'Guardar borrador',exact:true}).click();await wizard.getByRole('button',{name:'Guardar evidencia de esta actividad',exact:true}).click();await expect(wizard.getByText('Esta versión ya está guardada.',{exact:false})).toBeVisible();await page.reload();await expect(page.getByText('Práctica completada:',{exact:false})).toBeVisible();
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Descargar matriz CSV',exact:true}).click();expect((await download).suggestedFilename()).toBe('practice-1-matriz-casos.csv');
 await page.getByLabel('TC-01 · Título',{exact:true}).fill('Cambio de definición');await expect(page.getByText('Cobertura: 4/5',{exact:false})).toBeVisible();
 await page.setViewportSize({width:375,height:800});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:testInfo.outputPath('foundation-mobile.png')});
 await page.goto('/study/1#practical-exercise');await expect(page.getByRole('navigation',{name:'Etapas de la semana'}).getByRole('link',{name:'Práctica',exact:false})).toContainText('Actividad completada');
});
