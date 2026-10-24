import { Injectable } from '@nestjs/common';
import type { VerificationMailer } from '@qapath/identity';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { FirebaseEmailAdapter } from './firebase-email.adapter';

/** Strategy at the infrastructure boundary: same domain port, multiple mail transports. */
@Injectable()
export class VerificationEmailAdapter implements VerificationMailer {
  constructor(private readonly firebase: FirebaseEmailAdapter) {}

  async sendVerification(email: string, token: string): Promise<void> {
    const appUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
    // Fragment avoids leaking the secret through GET logs and Referer headers.
    const link = `${appUrl}/verify-email#token=${encodeURIComponent(token)}`;
    const transport = (process.env.EMAIL_TRANSPORT || 'resend').toLowerCase();

    if (transport === 'console' && process.env.NODE_ENV !== 'production') {
      console.warn(`[DEV ONLY] Verificación para ${email}: ${link}`);
      return;
    }
    if (transport === 'test-inbox' && process.env.NODE_ENV !== 'production') {
      if (!process.env.TEST_INBOX_DIR) throw new Error('TEST_INBOX_DIR requerido para pruebas.');
      await mkdir(process.env.TEST_INBOX_DIR, { recursive: true });
      const filename = createHash('sha256').update(email.toLowerCase()).digest('hex') + '.json';
      await writeFile(
        join(process.env.TEST_INBOX_DIR, filename),
        JSON.stringify({ email, token, createdAt: new Date().toISOString() }),
        { mode: 0o600 },
      );
      return;
    }
    if (transport === 'firebase') {
      await this.firebase.queueVerification(email, link);
      return;
    }
    if (transport !== 'resend') throw new Error('EMAIL_TRANSPORT inválido: usa firebase, resend, console o test-inbox.');

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!apiKey || !from) throw new Error('Resend: configura RESEND_API_KEY y EMAIL_FROM.');
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [email],
        subject: 'Verifica tu correo en QAPath Academy',
        text: `Abre este enlace dentro de 24 horas para verificar tu cuenta: ${link}\nSi no creaste la cuenta, ignora este mensaje.`,
      }),
    });
    if (!response.ok)
      throw new Error(`No fue posible solicitar el correo de verificación (HTTP ${response.status}).`);
  }
}
