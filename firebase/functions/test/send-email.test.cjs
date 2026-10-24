'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const source = fs.readFileSync(path.resolve(__dirname, '../index.js'), 'utf8');

function setup(sendMail) {
  const changes = [];
  const sent = [];
  let handler;
  const context = {
    exports: {}, module: { exports: {} }, console: { error() {} }, Date,
    require(id) {
      if (id === 'firebase-functions/v2/firestore') return { onDocumentCreated: (_options, fn) => { handler = fn; return fn; } };
      if (id === 'firebase-functions/params') return { defineSecret: name => ({ value: () => (name === 'QAPATH_SMTP_FROM' ? 'QAPath <no-reply@example.com>' : 'smtps://smtp.example.com:465') }) };
      if (id === 'nodemailer') return { createTransport: () => ({ async sendMail(message) { sent.push(message); return sendMail ? sendMail(message) : { messageId: 'mock-id' }; }, close() {} }) };
      if (id === 'firebase-admin/app') return { getApps: () => [], initializeApp: () => {} };
      if (id === 'firebase-admin/firestore') return { getFirestore: () => ({}) };
      throw new Error(id);
    },
  };
  vm.runInNewContext(source, context);
  assert.ok(handler);
  return {
    sent, changes,
    run: async doc => handler({ data: { data: () => doc, ref: { update: async update => { changes.push({ ...update }); } } } }),
  };
}

test('envía un correo válido y almacena el estado SUCCESS', async () => {
  const x = setup();
  await x.run({ to: 'qa@example.com', message: { subject: 'Verificación', text: 'Token de un solo uso' } });
  assert.equal(x.sent.length, 1);
  assert.equal(x.sent[0].to, 'qa@example.com');
  assert.ok(x.changes.some(s => s['delivery.state'] === 'SUCCESS'));
});

test('rechaza correo malformado y guarda ERROR sin mostrar tokens', async () => {
  const x = setup();
  await x.run({ to: 'no-email', message: { subject: 'Verificación', text: 'Token secreto' } });
  assert.equal(x.sent.length, 0);
  assert.ok(x.changes.some(s => s['delivery.state'] === 'ERROR'));
});

test('la falla SMTP deja evidencia de ERROR sin automatizar reenvíos duplicados', async () => {
  const x = setup(() => { throw new Error('SMTP_SECRET=never-log-this'); });
  await x.run({ to: 'qa@example.com', message: { subject: 'Verificación', text: 'Token secreto' } });
  assert.ok(x.changes.some(s => s['delivery.state'] === 'ERROR'));
  assert.equal(x.changes.some(s => JSON.stringify(s).includes('never-log-this')), false);
});
