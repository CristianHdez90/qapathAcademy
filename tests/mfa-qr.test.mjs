import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

test('QRCodeSVG usa una implementación local y el URI otpauth existente', () => {
  const src = read('apps/web/src/components/security/mfa-enrollment-card.tsx');
  assert.match(src, /QRCodeSVG/);
  assert.match(src, /value=\{uri\}/);
  assert.match(src, /otpauth:\/\/totp\//);
  assert.doesNotMatch(src, /qrserver|chart\.googleapis|https?:\/\//);
});

test('QR y alternativa manual se reutilizan en ambos flujos MFA', () => {
  for (const file of [
    'apps/web/src/app/auth/continue/page.tsx',
    'apps/web/src/components/academy/account-panel.tsx',
  ]) {
    assert.match(read(file), /<MfaEnrollmentCard uri=\{\w+\.uri\} secret=\{\w+\.secret\}\s*\/>/);
  }
});

test('MFA muestra manualmente la clave bajo demanda y copia sin persistirla', () => {
  const src = read('apps/web/src/components/security/mfa-enrollment-card.tsx');
  assert.match(src, /useState\(false\)/);
  assert.match(src, /Mostrar clave/);
  assert.match(src, /Ocultar clave/);
  assert.match(src, /navigator\.clipboard\.writeText\(secret\)/);
  assert.doesNotMatch(src, /localStorage|sessionStorage|fetch\(|console\.log/);
});

test('El frontend declara qrcode.react 4.2.0 o compatible', () => {
  const pkg = JSON.parse(read('apps/web/package.json'));
  assert.equal(pkg.dependencies['qrcode.react'], '^4.2.0');
});
