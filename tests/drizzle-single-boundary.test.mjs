import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const read = (relativePath) => readFileSync(new URL(relativePath, root), 'utf8');
const adapters = [
  'postgres-administration.adapter.ts',
  'postgres-identity.adapter.ts',
  'postgres-progress.adapter.ts',
  'postgres-security.adapter.ts'
];
test('Los adaptadores PostgreSQL usan operadores exportados por @qapath/database', () => {
  for (const file of adapters) {
    const source = read(`apps/api/src/infrastructure/adapters/${file}`);
    assert.doesNotMatch(source, /from\s+['"]drizzle-orm(?:\/pg-core)?['"]/);
    assert.match(source, /from\s+['"]@qapath\/database['"]/);
  }
});
test('El API no instala una instancia directa adicional de Drizzle', () => {
  const api = JSON.parse(read('apps/api/package.json'));
  assert.equal(api.dependencies?.['drizzle-orm'], undefined);
  const boundary = read('packages/database/src/index.ts');
  assert.match(boundary, /export\s+\{[^}]*\beq\b[^}]*\}\s+from\s+['"]drizzle-orm['"]/);
});
