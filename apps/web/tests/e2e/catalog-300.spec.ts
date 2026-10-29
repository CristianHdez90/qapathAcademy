import {test,expect,type Page} from '@playwright/test';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
const origin='http://127.0.0.1:3017';
const evidence=resolve(__dirname,'../../../../docs/specs/catalog-300/evidence');
async function session(page:Page,role='student-a'){const response=await page.request.post('/api/v1/auth/login',{headers:{Origin:origin},data:{email:`${role}@example.test`,password:'synthetic-fixture-only'}});expect(response.ok()).toBe(true)}
test('Home has all eight courses and a keyboard search; retired hero and modules are absent',async({page},info)=>{
 await page.goto('/');await expect(page.locator('.course-card')).toHaveCount(8);
 await expect(page.getByRole('heading',{name:'Explora cursos'})).toBeVisible();
 await expect(page.locator('[data-course-slug="cicd"],[data-course-slug="portafolio"]')).toHaveCount(0);
 await expect(page.getByText(/Domina el testing|Tu hoja de ruta|Antes del primer test/)).toHaveCount(0);
 await expect(page.locator('nav[aria-label="Navegación principal"] a')).toHaveCount(2);
 await expect(page.locator('nav[aria-label="Navegación principal"]')).not.toContainText(/Scrum|Proyecto|Administración|Ruta de 8/);
 await expect(page.getByText('Entrar / Crear cuenta',{exact:false})).toHaveCount(0);
 mkdirSync(evidence,{recursive:true});await page.screenshot({path:resolve(evidence,`home-${info.project.name}.png`),fullPage:true});
 const search=page.getByLabel('Buscar cursos',{exact:true}).last();await search.fill('PLAYWRÍGHT');
 await expect(page.locator('.course-card')).toHaveCount(1);await expect(page.locator('.course-card')).toContainText('Automatización con Playwright');
 await page.getByRole('button',{name:'Borrar búsqueda'}).click();await expect(page.locator('.course-card')).toHaveCount(8);
});
test('mobile search closes with Escape, restores focus and fits 320 px',async({page},info)=>{
 await page.setViewportSize({width:320,height:740});await page.goto('/courses');await expect(page.locator('.course-card')).toHaveCount(8);
 const opener=page.getByRole('button',{name:'Buscar cursos',exact:true});await opener.click();
 const dialog=page.getByRole('dialog',{name:'Buscar cursos',exact:true});await expect(dialog).toBeVisible();
 await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(opener).toBeFocused();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.screenshot({path:resolve(evidence,`mobile-${info.project.name}.png`),fullPage:true});
});
test('Scrum and CTFL reuse their existing experiences and course metadata',async({page})=>{
 // Mientras están «En construcción» (011) muestran el aviso; sus experiencias existentes siguen en sus rutas.
 await page.goto('/courses/equipo-scrum');await expect(page.getByRole('heading',{name:'En construcción'})).toBeVisible();await expect(page.getByRole('link',{name:'Estudiar Equipo y Scrum ↗'})).toHaveCount(0);
 await page.goto('/scrum');await expect(page.getByRole('heading',{level:1})).toBeVisible();
 await page.goto('/courses/istqb-ctfl');await expect(page.getByText(/24 semanas/)).toHaveCount(0);await expect(page.getByRole('heading',{name:'En construcción'})).toBeVisible();
 await page.goto('/certification/istqb');await expect(page.getByRole('heading',{level:1})).toBeVisible();
 await page.goto('/modules/manual');await expect(page).toHaveURL(/\/courses\/manual$/);await expect(page.getByRole('heading',{name:'En construcción'})).toBeVisible();await expect(page.getByRole('link',{name:/Semana \d+ ↗/})).toHaveCount(0);
 await page.goto('/modules/fundamentos');await expect(page).toHaveURL(/\/courses\/fundamentos$/);await expect(page.getByRole('link',{name:/Semana \d+ ↗/})).not.toHaveCount(0);
});
test('API errors have a retry and cannot masquerade as an empty catalog',async({page})=>{
 await page.route('**/api/v1/courses?*',route=>route.fulfill({status:503,json:{error:{message:'Catálogo temporalmente no disponible'}}}));
 await page.goto('/courses');await expect(page.getByRole('main').getByRole('alert')).toContainText('Catálogo temporalmente no disponible');await expect(page.getByText('No encontramos cursos',{exact:false})).toHaveCount(0);
 await page.unroute('**/api/v1/courses?*');await page.getByRole('button',{name:'Reintentar',exact:true}).click();await expect(page.locator('.course-card')).toHaveCount(8);
});
test('ADMIN creates, publishes, archives and restores without exposing drafts',async({page},info)=>{
 await session(page,'admin');await page.goto('/account');await page.getByRole('link',{name:'Gestionar cursos',exact:true}).click();
 await page.getByRole('button',{name:'Agregar curso'}).click();
 const form=page.getByRole('form',{name:'Nuevo curso'}),slug=`curso-e2e-${info.project.name}`;
 await form.getByLabel('Título',{exact:true}).fill('Curso E2E de catálogo');await form.getByLabel('Slug estable').fill(slug);await form.getByLabel('Resumen',{exact:true}).fill('Curso sintético para verificar publicación.');
 await form.getByLabel('Equipo y Scrum',{exact:true}).check();await form.getByRole('button',{name:'Crear borrador'}).click();
 await expect(page.getByRole('status')).toContainText('Curso guardado correctamente.');
 expect((await page.request.get(`/api/v1/courses/${slug}`)).status()).toBe(404);
 const editor=page.getByRole('form',{name:'Editar curso'});await editor.getByLabel('Visibilidad').selectOption('PUBLISHED');
 page.once('dialog',dialog=>dialog.accept());await editor.getByRole('button',{name:'Guardar cambios'}).click();
 await expect.poll(async()=> (await page.request.get(`/api/v1/courses/${slug}`)).status()).toBe(200);
 const row=page.getByRole('row').filter({hasText:slug});page.once('dialog',dialog=>dialog.accept());await row.getByRole('button',{name:'Archivar',exact:true}).click();
 await expect.poll(async()=> (await page.request.get(`/api/v1/courses/${slug}`)).status()).toBe(404);
 page.once('dialog',dialog=>dialog.accept());await row.getByRole('button',{name:'Restaurar',exact:true}).click();await expect(row).toContainText('Borrador');
 expect((await page.request.get(`/api/v1/courses/${slug}`)).status()).toBe(404);
 await page.screenshot({path:resolve(evidence,`admin-${info.project.name}.png`),fullPage:true});
});
test('student route ordering persists across logout/login without changing historical progress',async({page},info)=>{
 await page.goto('/login?next=%2Flearning-paths');await page.getByLabel('Correo electrónico').fill('student-a@example.test');await page.getByLabel('Contraseña',{exact:true}).fill('synthetic-fixture-only');await page.getByRole('button',{name:/Continuar/}).click();await expect(page).toHaveURL(/\/learning-paths$/);
 const before=await(await page.request.get('/api/v1/me/progress')).json();
 const title=`Ruta E2E ${info.project.name}`;await page.getByLabel('Nombre de la ruta').fill(title);
 for(const name of ['Fundamentos del Testing','QA Manual profesional'])await page.locator('li.path-course').filter({hasText:name}).getByRole('button',{name:'Añadir',exact:true}).click();
 const editor=page.locator('section[aria-labelledby="path-editor-title"]');await editor.getByRole('button',{name:'Subir QA Manual profesional',exact:true}).click();await editor.getByRole('button',{name:'Guardar ruta'}).click();
 await expect(page.getByRole('status')).toContainText('Ruta guardada.');
 const saved=(await(await page.request.get('/api/v1/me/learning-paths')).json()).data.find((path:{title:string})=>path.title===title);expect(saved.courses.map((course:{slug:string})=>course.slug)).toEqual(['manual','fundamentos']);
 await page.goto('/account');await page.getByRole('button',{name:'Cerrar sesión',exact:true}).click();await expect(page).toHaveURL(/\/login$/);
 await session(page);await page.goto('/learning-paths');await expect(page.getByRole('heading',{name:title,exact:false})).toBeVisible();
 expect((await(await page.request.get('/api/v1/me/progress')).json())).toEqual(before);
 await page.goto('/modules/cicd');await expect(page).toHaveURL(/\/legacy\/modules\/cicd$/);await expect(page.getByText('Contenido histórico · Tus notas',{exact:false})).toBeVisible();
 expect(before.data.weeks).toEqual([21,22,23,24]);
});
test('ADMIN APIs reject anonymous and STUDENT sessions and enforce path ownership',async({page})=>{
 expect((await page.request.get('/api/v1/admin/courses')).status()).toBe(401);await session(page,'student-a');expect((await page.request.get('/api/v1/admin/courses')).status()).toBe(403);
 const paths=(await(await page.request.get('/api/v1/me/learning-paths')).json()).data;
 await session(page,'student-b');if(paths.length)expect((await page.request.get('/api/v1/me/learning-paths/'+paths[0].id)).status()).toBe(404);
 await page.goto('/admin/courses');await expect(page.getByRole('main').getByRole('alert')).toContainText('No tienes permisos');
});
