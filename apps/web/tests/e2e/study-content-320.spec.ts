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
test('library: admin creates, publishes and assigns a lesson to a course index; students read it; delete is recoverable',async({page},info)=>{
 test.skip(info.project.name!=='chromium','Flujo de carga verificado en Chromium.');
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await session(page,'admin');await page.goto('/admin/content');
 await expect(page.getByRole('heading',{name:'Biblioteca de contenido'})).toBeVisible();
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
 // La vista previa (texto a la izquierda, gráficas a la derecha) está abierta por defecto.
 await expect(page.locator('.lesson-preview .study-section.has-aside')).toHaveCount(1);
 await expect(page.locator('.lesson-preview .study-mermaid-canvas svg')).toHaveCount(2);
 await expect(page.locator('.lesson-preview .react-flow__node')).toHaveCount(2);
 await page.getByLabel('Visibilidad').last().selectOption('PUBLISHED');
 await page.getByRole('button',{name:'Crear lección'}).click();await expect(page.getByText('Lección creada y publicada.')).toBeVisible();
 await expect(page.locator('.lesson-admin-list')).toContainText('Sin asignar a cursos');
 // Asignar desde «Contenido asignado» de Fundamentos y crear otra lección desde el propio curso (se agrega al índice).
 await page.goto('/admin/courses');await page.getByRole('searchbox',{name:/Buscar cursos administrados/}).fill('fundamentos');
 await page.getByRole('button',{name:/Editar Fundamentos/}).click();
 const assigned=page.locator('.assigned-content');
 await assigned.getByRole('checkbox',{name:/Ciclo de vida de un defecto/}).check();
 await expect(assigned.locator('.course-index-editor')).toContainText('Ciclo de vida de un defecto');
 await assigned.getByRole('button',{name:'＋ Crear lección nueva'}).click();
 const modal=page.getByRole('dialog');await modal.getByLabel('Título').fill('Glosario de defectos');
 await modal.getByLabel('Cargar archivos de estudio').setInputFiles([{name:'glosario.md',mimeType:'text/markdown',buffer:Buffer.from('# Glosario\n\n**Defecto**: diferencia entre lo esperado y lo obtenido.')}]);
 await modal.getByRole('button',{name:'Crear lección'}).click();await expect(page.getByText(/Se agregó al índice del curso/)).toBeVisible();
 await modal.getByRole('button',{name:'Cerrar'}).click();
 await expect(assigned.locator('.course-index-editor li')).toHaveCount(3);
 await assigned.getByRole('button',{name:'Bajar Ciclo de vida de un defecto'}).click();
 await page.getByRole('button',{name:'Guardar cambios'}).click();
 await expect(page.getByText('Curso guardado correctamente.')).toBeVisible();
 await page.context().clearCookies();await session(page,'student-a');
 await page.goto('/courses/fundamentos');
 await expect(page.locator('[data-supplementary] .module-chapters li')).toHaveCount(1); // el glosario es borrador: no se muestra
 await page.getByRole('link',{name:/Ciclo de vida de un defecto/}).click();
 await expect(page.getByRole('heading',{level:1,name:'Ciclo de vida de un defecto'})).toBeVisible();
 await expect(page.locator('.study-section.has-aside')).toHaveCount(1);
 await expect(page.locator('.study-mermaid-canvas svg')).toHaveCount(2);
 await expect(page.locator('.study-markdown mark')).toHaveCount(0);
 await page.getByRole('button',{name:'Sistema',exact:true}).click();await expect(page.locator('.study-balloon')).toContainText('Evalúa el producto completo.');
 await expect(page.locator('.recharts-bar-rectangle')).toHaveCount(2);
 await page.getByRole('button',{name:'Ver tabla'}).click();await expect(page.getByRole('table',{name:'Defectos por sprint'})).toContainText('S2');
 await expect(page.locator('.study-svg img')).toBeVisible();
 mkdirSync(evidence,{recursive:true});await page.screenshot({path:resolve(evidence,'lesson-chromium.png'),fullPage:true});
 // Eliminar (recuperable) desde la biblioteca: desaparece del curso; restaurar la devuelve sin asignar.
 await page.context().clearCookies();await session(page,'admin');await page.goto('/admin/content');
 const row=page.locator('.lesson-admin-list li',{hasText:'Ciclo de vida de un defecto'});await expect(row).toContainText('Fundamentos');
 page.once('dialog',d=>d.accept());await row.getByRole('button',{name:/Eliminar/}).click();
 await expect(page.getByText(/Lección eliminada/)).toBeVisible();
 expect((await (await page.request.get('/api/v1/courses/fundamentos/lessons')).json()).data).toEqual([]);
 await page.getByRole('tab',{name:'Eliminadas'}).click();
 await page.locator('.lesson-admin-list li',{hasText:'Ciclo de vida de un defecto'}).getByRole('button',{name:/Restaurar/}).click();
 await expect(page.getByText('Lección restaurada como borrador.')).toBeVisible();
 expect(errors).toEqual([]);
});
