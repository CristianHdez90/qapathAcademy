import {expect} from '@playwright/test';
import type {Page} from '@playwright/test';
export async function studyReading(page:Page){
 await expect(page.getByRole('navigation',{name:'Etapas de la semana'})).toHaveAttribute('aria-busy','false');
 const sections=page.locator('[data-reading-section]');
 await expect(sections).toHaveCount(4);
 for(const section of await sections.all()){
  await page.bringToFront();
  await section.scrollIntoViewIfNeeded();
  await expect(section).toHaveAttribute('data-reading-recorded','true',{timeout:10000});
 }
 await expect(page.getByText('✓ Lectura registrada',{exact:true})).toBeVisible();
}
