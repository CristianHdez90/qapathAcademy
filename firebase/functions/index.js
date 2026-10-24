'use strict';

/** Self-managed Firestore -> SMTP sender, independent of Firebase Extensions. */
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const nodemailer = require('nodemailer');
const { getApps, initializeApp } = require('firebase-admin/app');

if (!getApps().length) initializeApp();
const smtpUrl = defineSecret('QAPATH_SMTP_URL');
const smtpFrom = defineSecret('QAPATH_SMTP_FROM');

function validateMessage(doc) {
  const to = doc?.to;
  const subject = doc?.message?.subject;
  const text = doc?.message?.text;
  if (typeof to !== 'string' || !/^\S+@\S+\.\S+$/.test(to) ||
      typeof subject !== 'string' || !subject || typeof text !== 'string' || !text)
    throw new Error('Invalid mail document');
  return { to, subject, text };
}

exports.sendAcademyVerificationEmail = onDocumentCreated(
  {
    document: 'mail/{mailId}',
    region: 'us-central1',
    secrets: [smtpUrl, smtpFrom],
    retry: false, // Avoid automatic repeated sends after ambiguous SMTP failures.
    maxInstances: 3,
    timeoutSeconds: 60,
  },
  async (event) => {
    if (!event.data) return;
    const ref = event.data.ref;
    let transport;
    try {
      const { to, subject, text } = validateMessage(event.data.data());
      await ref.update({ 'delivery.state': 'PROCESSING' });
      transport = nodemailer.createTransport(smtpUrl.value());
      const info = await transport.sendMail({ from: smtpFrom.value(), to, subject, text });
      await ref.update({
        'delivery.state': 'SUCCESS',
        'delivery.sentAt': new Date(),
        'delivery.smtpMessageId': info.messageId || null,
      });
    } catch (error) {
      // Do not persist SMTP secrets, message contents, verification URLs or
      // untrusted full exception texts in logs or database.
      await ref.update({
        'delivery.state': 'ERROR',
        'delivery.errorCode': 'MAIL_DELIVERY_FAILED',
        'delivery.failedAt': new Date(),
      });
      console.error('Fallo al procesar un correo de verificación. Revisar configuración SMTP.');
    } finally {
      transport?.close();
    }
  },
);
