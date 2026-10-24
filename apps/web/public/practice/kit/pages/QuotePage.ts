import {expect,type Page} from '@playwright/test';
export class QuotePage {
 constructor(readonly page:Page){}
 async open(){await this.page.goto('/practice')}
 async calculate(quantity:string,coupon='',shipping='pickup'){
  await this.page.getByLabel('Producto ficticio').selectOption('basic');
  await this.page.getByLabel('Cantidad').fill(quantity);
  await this.page.getByLabel('Cupón').fill(coupon);
  await this.page.getByLabel('Envío').selectOption(shipping);
  await this.page.getByRole('button',{name:'Cotizar',exact:true}).click();
 }
 async expectTotal(value:string){await expect(this.page.getByTestId('quote-total')).toHaveText(value)}
}
