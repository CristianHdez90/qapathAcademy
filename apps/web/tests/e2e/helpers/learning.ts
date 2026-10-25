import {expect} from '@playwright/test';
import type {Page} from '@playwright/test';
export async function studyReading(page:Page){
 await expect(page.getByRole('navigation',{name:'Etapas de la semana'})).toHaveAttribute('aria-busy','false');
 const sections=page.locator('[data-reading-section]');await expect(sections).toHaveCount(4);
 for(const section of await sections.all()){
  await page.bringToFront();await page.getByLabel('Ir a un apartado').selectOption((await section.getAttribute('id'))!);
  let step=0;
  await expect.poll(async()=>{
   await section.evaluate((element,index)=>{const rect=element.getBoundingClientRect();window.scrollTo({top:window.scrollY+rect.top+Math.min(index*innerHeight*.6,Math.max(0,rect.height-innerHeight*.8)),behavior:'instant'})},step++);
   return section.getAttribute('data-reading-recorded');
  },{intervals:[300],timeout:30000}).toBe('true');
 }
 await expect(page.getByText('✓ Lectura registrada',{exact:true})).toBeVisible();
}
