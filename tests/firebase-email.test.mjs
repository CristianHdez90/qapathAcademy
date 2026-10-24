import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { Script, createContext } from 'node:vm';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const root = new URL('../apps/api/src/infrastructure/adapters/', import.meta.url);

function loadTs(relativeFile, requires = {}) {
  const source = readFileSync(new URL(relativeFile, root), 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      esModuleInterop: true,
    },
  });
  assert.equal(transpiled.diagnostics?.length || 0, 0);
  const module = { exports: {} };
  const context = createContext({
    module,
    exports: module.exports,
    require: (id) => {
      if (id === '@nestjs/common') return {
        Injectable: () => target => target,
        Optional: () => () => {},
      };
      if (id in requires) return requires[id];
      return require(id);
    },
    process,
    Buffer,
    Date,
    Promise,
    setTimeout,
    console,
    fetch,
  });
  new Script(transpiled.outputText, { filename: relativeFile }).runInContext(context);
  return module.exports;
}

const firebaseModule = loadTs('firebase-email.adapter.ts');
const { FirebaseEmailAdapter, readFirebaseMailConfig } = firebaseModule;
const config = {
  FIREBASE_PROJECT_ID: 'qapath-demo',
  FIREBASE_SERVICE_ACCOUNT_EMAIL: 'admin@qapath-demo.iam.gserviceaccount.com',
  FIREBASE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\\nTEST\\n-----END PRIVATE KEY-----\\n',
  FIREBASE_MAIL_COLLECTION: 'mail',
};

test('el correo de servicio solo es válido acompañado de proyecto y clave o archivo ADC', () => {
  assert.throws(() => readFirebaseMailConfig({ FIREBASE_SERVICE_ACCOUNT_EMAIL: config.FIREBASE_SERVICE_ACCOUNT_EMAIL }), /FIREBASE_PROJECT_ID/);
  assert.throws(() => readFirebaseMailConfig({ FIREBASE_PROJECT_ID: 'qapath-demo', FIREBASE_SERVICE_ACCOUNT_EMAIL: config.FIREBASE_SERVICE_ACCOUNT_EMAIL }), /FIREBASE_PRIVATE_KEY/);
  const result = readFirebaseMailConfig(config);
  assert.equal(result.clientEmail, config.FIREBASE_SERVICE_ACCOUNT_EMAIL);
  assert.ok(result.privateKey.includes('\nTEST\n'));
});

test('soporta credenciales ADC sin exponer la clave privada en .env', () => {
  const result = readFirebaseMailConfig({ FIREBASE_PROJECT_ID: 'qapath-demo', GOOGLE_APPLICATION_CREDENTIALS: 'C:/secrets/service-account.json' });
  assert.equal(result.credentialsFile, 'C:/secrets/service-account.json');
  assert.equal(result.collection, 'mail');
});

test('no permite rutas ni caracteres especiales en el nombre de colección', () => {
  assert.throws(() => readFirebaseMailConfig({ ...config, FIREBASE_MAIL_COLLECTION: 'mail/other' }), /FIREBASE_MAIL_COLLECTION/);
});

test('Firebase encola correo con expiración y nunca usa la cuenta de servicio como remitente', async () => {
  const previous = { ...Object.fromEntries(Object.keys(config).map(k => [k, process.env[k]])) };
  Object.assign(process.env, config);
  try {
    const published = [];
    const adapter = new FirebaseEmailAdapter(async (collection, doc) => published.push({ collection, doc }));
    const tokenLink = 'http://localhost:3000/verify-email#token=one-use-token';
    await adapter.queueVerification('student@example.com', tokenLink);
    assert.equal(published.length, 1);
    assert.equal(published[0].collection, 'mail');
    assert.equal(published[0].doc.to, 'student@example.com');
    assert.ok(published[0].doc.message.text.includes(tokenLink));
    assert.equal('from' in published[0].doc, false);
    assert.ok(new Date(published[0].doc.expireAt) > new Date());
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test('VerificationEmailAdapter delega a Firebase y conserva el formato de URL con fragmento', async () => {
  const emailModule = loadTs('verification-email.adapter.ts', { './firebase-email.adapter': firebaseModule });
  const previous = { EMAIL_TRANSPORT: process.env.EMAIL_TRANSPORT, APP_URL: process.env.APP_URL };
  try {
    process.env.EMAIL_TRANSPORT = 'firebase';
    process.env.APP_URL = 'http://localhost:3000/';
    let delivery;
    const adapter = new emailModule.VerificationEmailAdapter({
      queueVerification: async (email, url) => { delivery = { email, url }; },
    });
    await adapter.sendVerification('student@example.com', 'test_token_123');
    assert.equal(delivery.email, 'student@example.com');
    assert.equal(delivery.url, 'http://localhost:3000/verify-email#token=test_token_123');
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
