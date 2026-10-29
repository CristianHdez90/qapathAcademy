import {studyReading} from './helpers/learning';
import {test,expect} from '@playwright/test';
import {randomUUID} from 'node:crypto';
import {totp,verifyEmail} from './helpers/security';
/** Requiere admin bootstrap y PostgreSQL; nunca guardar credenciales en código. */
test('ADMIN: crear, consultar avance y suspender estudiante',async({page,browser})=>{
 test.skip(!process.env.E2E_ADMIN_EMAIL||!process.env.E2E_ADMIN_PASSWORD||!process.env.E2E_ADMIN_TOTP_SECRET||!process.env.TEST_INBOX_DIR,'Define E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, E2E_ADMIN_TOTP_SECRET y TEST_INBOX_DIR.');
 const email=`admin-e2e-${randomUUID().slice(0,8)}@example.test`;
 const password=`Academy-2026-${randomUUID()}!`;
 await page.goto('/login');await page.getByLabel('Correo electrónico').fill(process.env.E2E_ADMIN_EMAIL!);
 await page.getByLabel('Contraseña').fill(process.env.E2E_ADMIN_PASSWORD!);
 await page.getByRole('button',{name:/Continuar/}).click();await expect(page).toHaveURL(/auth\/continue/);await page.getByLabel('Código').fill(totp(process.env.E2E_ADMIN_TOTP_SECRET!));await page.getByRole('button',{name:'Verificar'}).click();await expect(page).toHaveURL(/\/admin/);
 await page.getByRole('button',{name:/Crear estudiante/}).click();
 await page.getByLabel('Correo electrónico').last().fill(email);
 await page.getByLabel('Contraseña inicial').fill(password);
 await page.getByRole('button',{name:'Crear cuenta'}).click();
 await expect(page.getByText(email).first()).toBeVisible();
 const studentContext=await browser.newContext();const student=await studentContext.newPage();
 try{
  await student.goto('/login');await student.getByLabel('Correo electrónico').fill(email);
  await student.getByLabel('Contraseña').fill(password);await student.getByRole('button',{name:/Continuar/}).click();
  await verifyEmail(student,email);await student.goto('/login');await student.getByLabel('Correo electrónico').fill(email);await student.getByLabel('Contraseña').fill(password);await student.getByRole('button',{name:/Continuar/}).click();await expect(student).toHaveURL(/auth\/continue/);await student.getByLabel('Nueva contraseña').fill(password+'-changed');await student.getByLabel('Confirmar contraseña').fill(password+'-changed');await student.getByRole('button',{name:'Cambiar contraseña'}).click();
  await student.goto('/study/3');await studyReading(student);
  await expect.poll(async()=>{const r=await student.request.get('/api/v1/me/progress');return (await r.json()).data.read.includes(1)}).toBe(true);
  await page.getByRole('button',{name:/Actualizar/}).click();
  await page.getByRole('button',{name:/Ver detalle/}).first().click();
  await expect(page.getByRole('heading',{name:'Historial académico'})).toBeVisible();
  page.once('dialog',d=>d.accept());
  await page.getByRole('button',{name:'Desactivar acceso'}).click();
  const denied=await student.request.get('/api/v1/me/progress');expect(denied.status()).toBe(401);
 }finally{await studentContext.close()}
});
