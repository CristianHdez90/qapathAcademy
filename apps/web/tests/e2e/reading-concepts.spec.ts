import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import type {StudyGuide} from '@qapath/contracts';
const guides=JSON.parse(readFileSync('../../libs/content/src/data/study-guides.json','utf8')) as Record<string,StudyGuide>;
const catalog=JSON.parse(readFileSync('../../libs/content/src/data/catalog.json','utf8')) as {modules:{id:string;weeks:number[]}[]};
test.beforeEach(async({page})=>{await page.route('**/api/v1/auth/me',route=>route.fulfill({status:401,json:{message:'No autenticado'}}))});
for(const curriculumModule of catalog.modules)test(`module ${curriculumModule.id} keeps explanations and examples without demonstrations`,async({page})=>{
 const week=curriculumModule.weeks[0],guide=guides[week],count=guide.sections.flatMap(section=>section.concepts||[]).length+(guide.example.concepts?.length||0);
 if(curriculumModule.id==='fundamentos'){await page.goto('/study/1#FND-W01-C01-T01');await expect(page.locator('.foundation-card-body')).toHaveCount(1);await expect(page.locator('.foundation-example dt')).toHaveCount(3);await expect(page.locator('.concept-demo')).toHaveCount(0);return}
 await page.goto(`/study/${week}`);
 await expect(page.locator('.reading-concept')).toHaveCount(count);
 await expect(page.locator('.concept-example')).toHaveCount(count);
 await expect(page.locator('.concept-demo')).toHaveCount(0);
 await expect(page.getByText('Así se aplica',{exact:true})).toHaveCount(0);
 await expect(page.getByRole('button',{name:/^(Ver|Pausar|Continuar|Repetir) animación:/})).toHaveCount(0);
});
test('advanced download retains code and original study content',async({page})=>{
 await page.goto('/study/17');const pending=page.waitForEvent('download');
 await page.getByRole('button',{name:/Descargar clase/}).click();
 const content=await readFile((await(await pending).path())!,'utf8');
 expect(content).toContain('class LoginPage');expect(content).toContain('Crea una clase para LoginPage.');
 expect(content).toContain('Situación:');expect(content).toContain('Secuencia:');
});

test('a chapter records reading on mobile only after covering its content',async({page})=>{
 test.setTimeout(90000);await page.clock.install();await page.setViewportSize({width:320,height:740});
 await page.goto('/study/7#chapter-0');await page.bringToFront();
 await expect(page.getByRole('navigation',{name:'Etapas de la semana'})).toHaveAttribute('aria-busy','false',{timeout:15000});
 const section=page.locator('#chapter-0');const bounds=await section.evaluate(node=>{const box=node.getBoundingClientRect();return {top:box.top+scrollY,height:box.height}});
 for(let top=bounds.top;top<bounds.top+bounds.height;top+=400){await page.evaluate(y=>scrollTo(0,y),top);await page.clock.runFor(250)}
 await expect.poll(async()=>page.evaluate(()=>JSON.parse(localStorage.getItem('qapath-academy-v2')||'{}').readingSections?.['7']||[])).toContain(0);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('qapath-academy-v2')||'{}').weeks||[])).toEqual([]);
});