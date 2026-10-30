import {test,expect,type Page} from '@playwright/test';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
/** SPEC-CONTENT-330 · Editor de semanas/capítulos/tarjetas con vista previa y lectura enfocada del estudiante. */
const origin='http://127.0.0.1:3017';
const evidence=resolve(__dirname,'../../../../docs/specs/content-330/evidence');
async function session(page:Page,role:string){await page.context().clearCookies();const response=await page.request.post('/api/v1/auth/login',{headers:{Origin:origin},data:{email:`${role}@example.test`,password:'synthetic-fixture-only'}});expect(response.ok()).toBe(true)}
test('admin builds weeks → chapters → cards with preview and minitest; student reads in focused mode and passes',async({page},info)=>{
 test.skip(info.project.name!=='chromium','Flujo verificado en Chromium.');
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await session(page,'admin');
 const course=(await (await page.request.get('/api/v1/admin/courses?search=fundamentos')).json()).data.items.find((c:{slug:string})=>c.slug==='fundamentos');
 await page.goto(`/admin/courses/${course.id}/content`);
 await expect(page.getByRole('heading',{name:'Fundamentos del Testing'})).toBeVisible();
 await page.getByRole('button',{name:'＋ Semana'}).click();
 await page.getByLabel('Título').fill('Ciclo de vida del defecto');
 await page.getByLabel(/Texto \(Markdown/).fill('Un **defecto** se reporta con pasos y evidencia.\n\n- Nuevo\n- Cerrado');
 await page.getByLabel('Cargar gráficas de la tarjeta').setInputFiles([{name:'estados.mmd',mimeType:'text/plain',buffer:Buffer.from('flowchart LR\n  N[Nuevo] --> C[Cerrado]')}]);
 const preview=page.getByLabel('Vista previa de la tarjeta');
 await expect(preview.getByRole('heading',{name:'Ciclo de vida del defecto'})).toBeVisible();
 await expect(preview.locator('.study-markdown strong')).toHaveText('defecto');await expect(preview.locator('.study-mermaid-canvas svg')).toHaveCount(1);
 // Segunda tarjeta y luego eliminarla
 await page.getByRole('button',{name:'＋ Tarjeta'}).click();await page.getByLabel('Título').fill('Tarjeta temporal');
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Eliminar Tarjeta temporal'}).click();
 await expect(page.locator('.outline-tree')).not.toContainText('Tarjeta temporal');
 // Minitest
 await page.getByRole('button',{name:/Minitest \(0\)/}).click();await page.getByRole('button',{name:'＋ Agregar pregunta'}).click();
 await page.getByLabel('Pregunta 1',{exact:true}).fill('¿Dónde está el defecto?');await page.getByLabel('Opción 1',{exact:true}).fill('En la mente');await page.getByLabel('Opción 2',{exact:true}).fill('En el código');
 await page.getByLabel('Opción 2 es la correcta').check();await page.getByLabel('Explicación (se muestra al calificar)').fill('El error es humano; el defecto queda en el código.');
 await page.getByRole('button',{name:'Guardar borrador'}).click();await expect(page.getByText('Borrador guardado. Publícalo cuando esté listo.')).toBeVisible();
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Publicar',exact:true}).click();await expect(page.getByText('Contenido publicado.')).toBeVisible();
 // Estudiante
 await session(page,'student-a');await page.goto('/courses/fundamentos');
 await expect(page.getByRole('heading',{name:'Clases y actividades'})).toBeVisible();await expect(page.locator('.module-chapters')).toContainText('0/1 tarjetas leídas');
 await page.getByRole('link',{name:/Comenzar: /}).click();
 await expect(page.getByRole('heading',{level:2,name:'Ciclo de vida del defecto'})).toBeVisible();await expect(page.locator('.sidebar')).toBeHidden();await expect(page.locator('.study-section.has-aside .study-mermaid-canvas svg')).toHaveCount(1);
 await page.getByRole('button',{name:/Menú/}).click();await expect(page.getByRole('dialog',{name:'Menú del curso'}).locator('.course-menu-chapters')).toContainText('Capítulo 01');await page.getByRole('button',{name:'Cerrar Menú del curso'}).click();
 await page.getByRole('button',{name:/Avance del curso/}).click();await expect(page.getByRole('dialog',{name:'Avance del curso'})).toContainText('Minitest · Nuevo capítulo');await page.getByRole('button',{name:'Cerrar Avance del curso'}).click();
 await page.getByRole('button',{name:'Ir al minitest →'}).click();
 await page.getByLabel('En la mente').check();await page.getByRole('button',{name:'Calificar minitest'}).click();await expect(page.getByText(/Necesitas 70 %/)).toBeVisible();
 await page.getByRole('button',{name:'Repetir minitest'}).click();await page.getByLabel('En el código').check();await page.getByRole('button',{name:'Calificar minitest'}).click();
 await expect(page.getByText('¡Capítulo aprobado!')).toBeVisible();
 mkdirSync(evidence,{recursive:true});await page.screenshot({path:resolve(evidence,'reader-chromium.png'),fullPage:true});
 await page.goto('/courses/fundamentos');await expect(page.locator('.module-chapters')).toContainText('✓ Aprobado');
 // Restaurar el curso para las demás pruebas: despublicar conserva el borrador
 await session(page,'admin');await page.goto(`/admin/courses/${course.id}/content`);
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Despublicar'}).click();await expect(page.getByText(/Contenido despublicado/)).toBeVisible();
 expect(errors).toEqual([]);
});
