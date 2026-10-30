import {test,expect,type Page} from '@playwright/test';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
/** SPEC-CONTENT-320 · Contenido de estudio por archivos: carga en admin y lectura del estudiante. */
const origin='http://127.0.0.1:3017';
const evidence=resolve(__dirname,'../../../../docs/specs/content-320/evidence');
async function session(page:Page,role:string){const response=await page.request.post('/api/v1/auth/login',{headers:{Origin:origin},data:{email:`${role}@example.test`,password:'synthetic-fixture-only'}});expect(response.ok()).toBe(true)}
const md='# Ciclo de vida de un defecto\n\nUn **defecto** se reporta con evidencia.\n\n| Estado | Quién |\n|---|---|\n| Nuevo | QA |\n\n```mermaid\nflowchart LR\n  N[Nuevo] --> C[Cerrado]\n```\n\nHTML crudo: <mark>no se interpreta</mark>';
const graph=JSON.stringify({type:'graph',title:'Niveles de prueba',nodes:[{id:'componente',label:'Componente',group:'primary',detail:{text:'Verifica una unidad aislada.'}},{id:'sistema',label:'Sistema',group:'accent',detail:{title:'Prueba de sistema',text:'Evalúa el producto completo.',bullets:['Funcional y no funcional']}}],edges:[{from:'componente',to:'sistema'}]});
const chart=JSON.stringify({type:'chart',title:'Defectos por sprint',chart:'bar',xKey:'sprint',series:[{key:'abiertos',label:'Abiertos'}],data:[{sprint:'S1',abiertos:4},{sprint:'S2',abiertos:2}]});
test('admin uploads .md/.mmd/.json/.svg, rejects .drawio, previews and publishes; students read the lesson',async({page},info)=>{
 test.skip(info.project.name!=='chromium','Flujo de carga verificado en Chromium.');
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await session(page,'admin');await page.goto('/admin/courses');
 await page.getByRole('searchbox',{name:/Buscar cursos administrados/}).fill('fundamentos');
 await page.getByRole('button',{name:/Editar Fundamentos/}).click();
 await expect(page.getByRole('heading',{name:/Lecciones de «Fundamentos/})).toBeVisible();
 await page.getByRole('button',{name:'＋ Nueva lección'}).click();
 await page.getByLabel('Cargar archivos de estudio').setInputFiles([
  {name:'01-lectura.md',mimeType:'text/markdown',buffer:Buffer.from(md)},
  {name:'02-flujo.mmd',mimeType:'text/plain',buffer:Buffer.from('sequenceDiagram\n  QA->>App: Reserva\n  App-->>QA: Ocupado')},
  {name:'03-niveles.json',mimeType:'application/json',buffer:Buffer.from(graph)},
  {name:'04-defectos.json',mimeType:'application/json',buffer:Buffer.from(chart)},
  {name:'05-reporte.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10"/></svg>')},
  {name:'arquitectura.drawio',mimeType:'application/xml',buffer:Buffer.from('<mxfile/>')},
 ]);
 await expect(page.getByLabel('Título').last()).toHaveValue('Ciclo de vida de un defecto');
 await expect(page.getByText(/deben exportarse a SVG/)).toBeVisible();
 await page.getByRole('button',{name:'Crear lección'}).click();await expect(page.getByText('Retira los archivos con errores antes de guardar.')).toBeVisible();
 await page.getByRole('button',{name:'Retirar arquitectura.drawio'}).click();
 await page.getByRole('button',{name:'Vista previa'}).click();
 await expect(page.locator('.lesson-preview .study-mermaid-canvas svg')).toHaveCount(2);
 await expect(page.locator('.lesson-preview .react-flow__node')).toHaveCount(2);
 await page.getByRole('button',{name:'Crear lección'}).click();await expect(page.getByText(/Lección creada como borrador/)).toBeVisible();
 await page.getByLabel('Visibilidad').last().selectOption('PUBLISHED');await page.getByRole('button',{name:'Guardar lección'}).click();
 await expect(page.getByText('Lección guardada y publicada.')).toBeVisible();
 await page.context().clearCookies();await session(page,'student-a');
 await page.goto('/courses/fundamentos');await page.getByRole('link',{name:/Ciclo de vida de un defecto/}).click();
 await expect(page.getByRole('heading',{level:1,name:'Ciclo de vida de un defecto'})).toBeVisible();
 await expect(page.locator('.study-mermaid-canvas svg')).toHaveCount(2);
 await expect(page.locator('.study-markdown mark')).toHaveCount(0);
 await page.getByRole('button',{name:'Sistema',exact:true}).click();await expect(page.locator('.study-balloon')).toContainText('Evalúa el producto completo.');
 await expect(page.locator('.recharts-bar-rectangle')).toHaveCount(2);
 await page.getByRole('button',{name:'Ver tabla'}).click();await expect(page.getByRole('table',{name:'Defectos por sprint'})).toContainText('S2');
 await expect(page.locator('.study-svg img')).toBeVisible();
 mkdirSync(evidence,{recursive:true});await page.screenshot({path:resolve(evidence,'lesson-chromium.png'),fullPage:true});
 expect(errors).toEqual([]);
});
