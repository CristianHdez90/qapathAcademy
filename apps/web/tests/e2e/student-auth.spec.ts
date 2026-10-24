import {studyReading} from './helpers/learning';
import {test,expect} from '@playwright/test';
import {randomUUID} from 'node:crypto';
import {verifyEmail} from './helpers/security';
/** E2E sensible a correo: requiere backend con EMAIL_TRANSPORT=test-inbox y TEST_INBOX_DIR compartido. */
test('registro → verificar correo → iniciar sesión → guardar progreso → aislamiento RBAC',async({page,request})=>{
 test.skip(!process.env.TEST_INBOX_DIR,'Configura TEST_INBOX_DIR y EMAIL_TRANSPORT=test-inbox para tests de correo.');
 const suffix=randomUUID().slice(0,12);const email=`qa-${suffix}@example.test`,password=`Strong-Study-${suffix}-2026`;
 expect((await request.get('/api/v1/me/progress')).status()).toBe(401);
 await page.goto('/register');await page.getByLabel('Correo electrónico').fill(email);
 await page.getByLabel('Contraseña',{exact:true}).fill(password);await page.getByLabel('Confirmar contraseña').fill(password);
 await page.getByRole('button',{name:/Registrarme/}).click();
 await expect(page.getByText(/enviamos instrucciones de verificación/)).toBeVisible();
 await verifyEmail(page,email);
 await page.goto('/login');await page.getByLabel('Correo electrónico').fill(email);await page.getByLabel('Contraseña').fill(password);
 await page.getByRole('button',{name:/Continuar/}).click();await expect(page).toHaveURL(/account/);
 await page.goto('/study/1');await studyReading(page);
 await expect.poll(async()=>{const response=await page.request.get('/api/v1/me/progress');return (await response.json()).data.read.includes(1)}).toBe(true);
 await page.reload();await expect(page.getByText('✓ Lectura registrada',{exact:true})).toBeVisible();
 expect((await page.request.get('/api/v1/admin/status')).status()).toBe(403);
 await page.goto('/account');await page.getByRole('button',{name:'Cerrar sesión'}).click();await expect(page).toHaveURL(/login/);
 await page.getByLabel('Correo electrónico').fill(email);await page.getByLabel('Contraseña').fill(password);
 await page.getByRole('button',{name:/Continuar/}).click();await page.goto('/study/1');await expect(page.getByText('✓ Lectura registrada',{exact:true})).toBeVisible();
});
