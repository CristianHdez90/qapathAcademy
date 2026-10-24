import {test,expect} from '../fixtures/training';
test('cotización mínima @smoke',async({quotePage})=>{await quotePage.calculate('1');await quotePage.expectTotal('35000 COP')});
test('total con descuento y envío',async({quotePage})=>{await quotePage.calculate('3','QA10','delivery');await quotePage.expectTotal('104500 COP')});
test('validación de cantidad',async({quotePage,page})=>{await quotePage.calculate('0');await expect(page.getByRole('region',{name:'Cotizador QA Store'}).getByRole('alert')).toContainText('Cantidad')});
