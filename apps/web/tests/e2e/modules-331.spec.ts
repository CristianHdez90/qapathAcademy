import {test,expect,type Page} from '@playwright/test';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
/**
 * SPEC-CONTENT-331 · Módulos propios + índice fiel a los cursos base + resumen .md con enlaces a tarjetas en lectura enfocada + slug editable.
 */
const origin='http://127.0.0.1:3017';
const evidence=resolve(__dirname,'../../../../docs/specs/content-331/evidence');
async function session(page:Page,role:string){await page.context().clearCookies();const response=await page.request.post('/api/v1/auth/login',{headers:{Origin:origin},data:{email:`${role}@example.test`,password:'synthetic-fixture-only'}});expect(response.ok()).toBe(true)}
const api=async(page:Page,path:string,method:string,data?:unknown)=>{const r=await page.request.fetch('/api/v1'+path,{method,headers:{Origin:origin},data});expect(r.ok(),await r.text()).toBe(true);return (await r.json()).data};
test('admin creates an own module with a .md week index; student opens the linked card in focused mode',async({page},info)=>{
 test.skip(info.project.name!=='chromium','Flujo verificado en Chromium.');
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await session(page,'admin');
 // 1) Crear el módulo desde «Módulos y experiencias»
 await page.goto('/admin/modules');
 await page.getByRole('button',{name:'＋ Nuevo módulo'}).click();
 await page.getByLabel('Nombre').fill('Pruebas de API');await page.getByLabel('Descripción (opcional)').fill('Verbos, códigos y contratos.');
 await page.getByRole('button',{name:'Crear módulo'}).click();await expect(page.getByText(/Módulo creado/)).toBeVisible();
 await page.getByRole('link',{name:'Editar contenido Pruebas de API'}).click();
 await expect(page.getByRole('heading',{name:'Pruebas de API'})).toBeVisible();
 // 2) Semana con dos tarjetas; la segunda se carga desde C02-codigos.md (queda como origen para los enlaces)
 await page.getByRole('button',{name:'＋ Semana'}).click();
 await page.getByLabel('Título').fill('Verbos HTTP');await page.getByLabel(/Texto \(Markdown/).fill('**GET** consulta; **POST** crea.');
 await page.getByRole('button',{name:'＋ Tarjeta'}).click();await page.getByLabel('Título').fill('Códigos de estado');
 await page.getByLabel('Cargar gráficas de la tarjeta').setInputFiles([{name:'C02-codigos.md',mimeType:'text/markdown',buffer:Buffer.from('2xx éxito, 4xx error del cliente.')}]);
 await expect(page.getByLabel('Archivo de origen (opcional)')).toHaveValue('C02-codigos.md');
 // 3) Resumen de la semana desde un .md (tabla índice con enlaces)
 await page.locator('.outline-tree').getByRole('button',{name:/^Semana 1 ·/}).click();
 await page.getByLabel('Título').fill('Semana de APIs');
 await page.getByLabel('Cargar .md del índice').setInputFiles([{name:'indice.md',mimeType:'text/markdown',buffer:Buffer.from('| # | Tema |\n|---|---|\n| 1 | [Verbos](capitulo:1) |\n| 2 | [Códigos de estado](C02-codigos.md) |\n| 3 | [Pendiente](C09-otro.md) |')}]);
 const weekPreview=page.getByLabel('Vista previa del índice de la semana');
 await expect(weekPreview.getByRole('link',{name:'Códigos de estado'})).toBeVisible();
 await expect(weekPreview.getByRole('link',{name:'Pendiente'})).toHaveCount(0);await expect(weekPreview).toContainText('Pendiente');
 await expect(page.getByText(/1 enlace no apunta/)).toBeVisible();
 await page.getByRole('button',{name:'Guardar borrador'}).click();await expect(page.getByText(/Borrador guardado/)).toBeVisible();
 page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Publicar',exact:true}).click();await expect(page.getByText('Contenido publicado.')).toBeVisible();
 // 4) Asignarlo a un curso y cambiar su slug (URL)
 const mod=(await api(page,'/admin/modules','GET') as {id:string;title:string}[]).find(m=>m.title==='Pruebas de API')!;
 const input={slug:'apis-basico',title:'APIs básico',summary:'Curso con módulo propio',description:'',category:'QA',skills:[],position:40,cover:null,contentKind:'CURATED',comingSoon:false,assignments:[{kind:'MODULE',ref:mod.id}]};
 const created=await api(page,'/admin/courses','POST',input);await api(page,`/admin/courses/${created.id}`,'PATCH',{...input,revision:created.revision,status:'PUBLISHED'});
 await page.goto('/admin/courses');await page.getByRole('searchbox',{name:'Buscar cursos administrados'}).fill('APIs básico');
 await page.getByRole('row',{name:/APIs básico/}).getByRole('button',{name:/Editar/}).first().click();
 const slug=page.getByLabel('Slug estable (URL)');await expect(slug).toBeEditable();await slug.fill('apis-rest');
 await expect(page.locator('#slug-hint')).toContainText('/courses/apis-basico');
 await expect(page.getByText('Pruebas de API',{exact:false}).first()).toBeVisible();
 page.on('dialog',d=>void d.accept());await page.getByRole('button',{name:/Guardar cambios/}).click();
 await expect.poll(async()=>(await page.request.get('/api/v1/courses/apis-rest')).status()).toBe(200);
 page.removeAllListeners('dialog');
 // 5) Estudiante: un solo índice con la estructura de los cursos base
 await session(page,'student-a');await page.goto('/courses/apis-rest');
 await expect(page.locator('.page-heading .pill')).toHaveText('1 semana');
 await expect(page.getByRole('heading',{name:'Clases y actividades'})).toHaveCount(1);
 await expect(page.locator('.lesson-row .lesson-link')).toContainText('SEMANA 01');
 await expect(page.locator('.module-chapters')).toContainText('Capítulo 01 · Nuevo capítulo');
 await expect(page.locator('.outline-week-summary table')).toBeVisible();
 mkdirSync(evidence,{recursive:true});await page.screenshot({path:resolve(evidence,'course-index-chromium.png'),fullPage:true});
 await page.locator('.outline-week-summary').getByRole('link',{name:'Códigos de estado'}).click();
 // 6) Lectura enfocada: sin barra lateral, abre la tarjeta enlazada
 await expect(page).toHaveURL(/\/courses\/apis-rest\/learn\?card=/);
 await expect(page.getByRole('heading',{level:2,name:'Códigos de estado'})).toBeVisible();
 await expect(page.locator('.focused-study')).toBeVisible();await expect(page.locator('.sidebar')).toBeHidden();
 await expect(page.getByRole('navigation',{name:'Herramientas de estudio'})).toBeVisible();
 await page.screenshot({path:resolve(evidence,'focused-card-chromium.png'),fullPage:true});
 await page.getByRole('button',{name:/Menú/}).click();await page.getByRole('dialog',{name:'Menú del curso'}).getByRole('link',{name:/Capítulo 01/}).click();
 await expect(page.getByRole('heading',{level:2,name:'Verbos HTTP'})).toBeVisible();
 expect(errors).toEqual([]);
});
