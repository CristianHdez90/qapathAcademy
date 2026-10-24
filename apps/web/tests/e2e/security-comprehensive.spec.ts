/**
 * QAPath Academy v6.1 - Pruebas E2E de seguridad con Playwright (APIRequestContext).
 * Crea cuentas STUDENT temporales en la DB de desarrollo. No usar con datos productivos.
 * Se habilita únicamente con E2E_ALLOW_DB_WRITES=true y TEST_INBOX_DIR.
 * No imprimir contraseñas, tokens de verificación ni códigos de recuperación.
 */
import { expect, request as playwrightRequest, test } from '@playwright/test';
import type { APIRequestContext, APIResponse } from '@playwright/test';
import { createHash, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { totp } from './helpers/security';

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:3000';
const required = process.env.E2E_ALLOW_DB_WRITES === 'true' && !!process.env.TEST_INBOX_DIR;

type Session = APIRequestContext;
type LoginResult = { stage: string; user?: { id: string; role: string } };
type Student = { email: string; password: string; api: Session; userId: string };

async function context(): Promise<Session> {
  return playwrightRequest.newContext({
    baseURL,
    extraHTTPHeaders: { Origin: new URL(baseURL).origin, Accept: 'application/json' },
  });
}

async function asData<T>(response: APIResponse): Promise<T> {
  expect(response.ok(), `HTTP ${response.status()} al consultar API`).toBeTruthy();
  return (await response.json() as {data:T}).data;
}

async function readVerificationToken(email: string): Promise<string> {
  const file = join(process.env.TEST_INBOX_DIR!, `${createHash('sha256').update(email).digest('hex')}.json`);
  let token = '';
  await expect.poll(async () => {
    try {
      const payload = JSON.parse(await readFile(file, 'utf8')) as {token?:string};
      token = payload.token ?? '';
      return token.length > 30;
    } catch { return false; }
  }, { timeout: 20_000, message: 'No apareció el email en test-inbox; comprueba EMAIL_TRANSPORT=test-inbox en NestJS' }).toBe(true);
  return token;
}

async function registerStudent(): Promise<Student> {
  const api = await context();
  const suffix = randomUUID().replace(/-/g, '').slice(0, 16);
  const email = `qa-e2e-${suffix}@example.test`;
  const password = `QaPath-${suffix}-Security-2026!`;
  try {
    await asData(await api.post('/api/v1/auth/register', { data: { email, password } }));
    const token = await readVerificationToken(email);
    await asData(await api.post('/api/v1/auth/verify-email', { data: { token } }));
    const login = await asData<LoginResult>(await api.post('/api/v1/auth/login', { data: { email, password } }));
    expect(login.stage).toBe('AUTHENTICATED');
    expect(login.user?.role).toBe('STUDENT');
    expect(login.user?.id).toBeTruthy();
    return { email, password, api, userId: login.user!.id };
  } catch (error) { await api.dispose(); throw error; }
}

async function login(api: Session, email: string, password: string): Promise<LoginResult> {
  return asData<LoginResult>(await api.post('/api/v1/auth/login', { data: { email, password } }));
}

async function logout(api: Session): Promise<void> {
  await asData(await api.post('/api/v1/auth/logout'));
}

test.describe('QAPath - seguridad E2E y persistencia real', () => {
  test.skip(!required, 'Requiere E2E_ALLOW_DB_WRITES=true, TEST_INBOX_DIR y NestJS con EMAIL_TRANSPORT=test-inbox.');
  test.describe.configure({ mode: 'serial' });

  test('RBAC: anónimo y STUDENT no pueden consultar ni modificar administración', async () => {
    const anonymous = await context();
    const student = await registerStudent();
    try {
      expect((await anonymous.get('/api/v1/admin/status')).status()).toBe(401);
      expect((await anonymous.get('/api/v1/me/progress')).status()).toBe(401);
      for (const path of ['/api/v1/admin/status', '/api/v1/admin/summary', '/api/v1/admin/students', '/api/v1/admin/audit']) {
        expect((await student.api.get(path)).status(), `GET ${path}`).toBe(403);
      }
      const create = await student.api.post('/api/v1/admin/students', {
        data: { email: `forbidden-${randomUUID()}@example.test`, password: 'NoCrear-Desde-Student-2026!' },
      });
      expect(create.status()).toBe(403);
      expect((await student.api.get('/api/v1/admin/students/' + student.userId)).status()).toBe(403);
      // Un estudiante tampoco puede asignar userId a la escritura de progreso (strict DTO).
      expect((await student.api.patch('/api/v1/me/progress', {
        data: { type: 'toggle', key: 'weeks', value: 1, userId: randomUUID() },
      })).status()).toBe(400);
    } finally { await student.api.dispose(); await anonymous.dispose(); }
  });

  test('Persistencia: avance sobrevive al logout y no se comparte con otro estudiante', async () => {
    const a = await registerStudent();
    const b = await registerStudent();
    const nextSession = await context();
    try {
      const before = await asData<{weeks:number[]; read:number[]}>(await b.api.get('/api/v1/me/progress'));
      expect(before.weeks).not.toContain(1);
      expect(before.read).not.toContain(1);

      expect((await a.api.patch('/api/v1/me/progress',{data:{type:'toggle',key:'weeks',value:1}})).status()).toBe(400);
      for(let section=0;section<4;section++)await asData(await a.api.patch('/api/v1/me/progress',{data:{type:'reading-section',week:1,section}}));
      await logout(a.api);
      expect((await a.api.get('/api/v1/me/progress')).status()).toBe(401);

      const reLogin = await login(nextSession, a.email, a.password);
      expect(reLogin.stage).toBe('AUTHENTICATED');
      const recovered = await asData<{weeks:number[];read:number[]}>(await nextSession.get('/api/v1/me/progress'));
      expect(recovered.weeks).not.toContain(1);
      expect(recovered.read).toContain(1);

      const other = await asData<{weeks:number[];read:number[]}>(await b.api.get('/api/v1/me/progress'));
      expect(other.weeks).not.toContain(1);
      expect(other.read).not.toContain(1);
    } finally { await a.api.dispose(); await b.api.dispose(); await nextSession.dispose(); }
  });

  test('MFA: un recovery code permite un login una sola vez y no vuelve a aceptarse', async () => {
    const student = await registerStudent();
    try {
      const enrollment = await asData<{secret:string;uri:string}>(await student.api.post('/api/v1/auth/mfa/setup', {
        data: { password: student.password },
      }));
      expect(enrollment.uri.startsWith('otpauth://totp/')).toBe(true);
      const activation = await asData<{recoveryCodes:string[]}>(await student.api.post('/api/v1/auth/mfa/activate', {
        data: { code: totp(enrollment.secret) },
      }));
      expect(activation.recoveryCodes).toHaveLength(8);
      const [firstCode, secondCode] = activation.recoveryCodes;
      // No registrar o imprimir estos valores en los logs de Playwright.
      await logout(student.api);
      expect((await student.api.get('/api/v1/me/progress')).status()).toBe(401);
      expect((await login(student.api,student.email,student.password)).stage).toBe('MFA_VERIFY');
      const accepted = await asData<LoginResult>(await student.api.post('/api/v1/auth/mfa/verify', {
        data: { code: firstCode },
      }));
      expect(accepted.stage).toBe('AUTHENTICATED');
      await logout(student.api);
      expect((await login(student.api,student.email,student.password)).stage).toBe('MFA_VERIFY');
      expect((await student.api.post('/api/v1/auth/mfa/verify', {
        data: { code: firstCode },
      })).status()).toBe(401);
      const secondLogin = await asData<LoginResult>(await student.api.post('/api/v1/auth/mfa/verify', {
        data: { code: secondCode },
      }));
      expect(secondLogin.stage).toBe('AUTHENTICATED');
    } finally { await student.api.dispose(); }
  });
});

// Lectura positiva ADMIN sin mutaciones: se ejecuta opcionalmente con una
// cuenta ADMIN exclusiva de QA, preferentemente no una cuenta personal.
test('ADMIN positivo: solo ADMIN obtiene status y summary después de TOTP', async () => {
  test.skip(!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD || !process.env.E2E_ADMIN_TOTP_SECRET,
    'Configura credenciales de un administrador DE PRUEBA mediante variables de entorno locales.');
  const api = await context();
  try {
    const stage = await login(api, process.env.E2E_ADMIN_EMAIL!, process.env.E2E_ADMIN_PASSWORD!);
    expect(stage.stage).toBe('MFA_VERIFY');
    const result = await asData<LoginResult>(await api.post('/api/v1/auth/mfa/verify', {
      data: {code: totp(process.env.E2E_ADMIN_TOTP_SECRET!)},
    }));
    expect(result.user?.role).toBe('ADMIN');
    expect((await api.get('/api/v1/admin/status')).status()).toBe(200);
    expect((await api.get('/api/v1/admin/summary')).status()).toBe(200);
    expect((await api.get('/api/v1/me/progress')).status()).toBe(403);
  } finally { await api.dispose(); }
});
