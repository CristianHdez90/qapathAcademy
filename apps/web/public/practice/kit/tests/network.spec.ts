import {test,expect} from '@playwright/test';
test('503 controlado y recuperación',async({page})=>{
 await page.route('**/api/v1/practice/quotes',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({sandbox:true,error:'Servicio de práctica temporalmente no disponible'})}));
 await page.goto('/practice');await page.getByRole('button',{name:'Cotizar',exact:true}).click();
 await expect(page.getByRole('region',{name:'Cotizador QA Store'}).getByRole('alert')).toContainText('temporalmente');
 await page.unroute('**/api/v1/practice/quotes');await page.getByRole('button',{name:'Cotizar',exact:true}).click();
 await expect(page.getByTestId('quote-total')).toHaveText('35000 COP');
});
