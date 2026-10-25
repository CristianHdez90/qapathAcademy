import {test,expect} from '@playwright/test';
// En el kit: BASE_URL se define en playwright.config.ts.
test('TC-01 cotización básica con recogida',async({page})=>{
 // Given: producto basic, cantidad 1, sin cupón, recogida.
 await page.goto('/practice');
 await page.getByLabel('Producto ficticio').selectOption('basic');
 await page.getByLabel('Cantidad',{exact:true}).fill('1');
 await page.getByLabel('Cupón',{exact:true}).fill('');
 await page.getByLabel('Envío',{exact:true}).selectOption('pickup');
 // When: solicito una cotización.
 await page.getByRole('button',{name:'Cotizar',exact:true}).click();
 // Then: el total esperado es 35000 COP.
 await expect(page.getByTestId('quote-total')).toHaveText('35000 COP');
});
