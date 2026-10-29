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
    const link = this.link('/verify-email', token);
    await this.deliver(email, token, link, {
      label: 'Verificación',
      subject: 'Verifica tu correo en QAPath Academy',
      text: `Abre este enlace dentro de 24 horas para verificar tu cuenta: ${link}\nSi no creaste la cuenta, ignora este mensaje.`,
      firebase: () => this.firebase.queueVerification(email, link),
    });
  }

  /** «¿Perdiste tu app?»: enlace de un solo uso para restablecer MFA (30 minutos). */
  async sendMfaReset(email: string, token: string): Promise<void> {
    const link = this.link('/auth/mfa-reset', token);
    const subject = 'Restablece tu autenticación en dos pasos — QAPath Academy';
    const text = `Recibimos una solicitud para restablecer la autenticación en dos pasos (MFA) de tu cuenta.\n\nAbre este enlace dentro de 30 minutos para confirmarla:\n\n${link}\n\nAl confirmarla se eliminan tu clave MFA y tus códigos de recuperación, se cierran tus sesiones y en el próximo inicio de sesión vincularás tu app con un QR nuevo.\nSi no fuiste tú, ignora este mensaje y cambia tu contraseña.`;
    await this.deliver(email, token, link, {
      label: 'Restablecer MFA',
      subject,
      text,
      firebase: () => this.firebase.queueMessage(email, subject, text),
      kind: 'mfa-reset',
    });
  }

  // Fragment avoids leaking the secret through GET logs and Referer headers.
  private link(path: string, token: string) {
    const appUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
    return `${appUrl}${path}#token=${encodeURIComponent(token)}`;
  }

  private async deliver(
    email: string,
    token: string,
    link: string,
    m: { label: string; subject: string; text: string; firebase: () => Promise<void>; kind?: string },
  ): Promise<void> {
    const transport = (process.env.EMAIL_TRANSPORT || 'resend').toLowerCase();

    if (transport === 'console' && process.env.NODE_ENV !== 'production') {
      console.warn(`[DEV ONLY] ${m.label} para ${email}: ${link}`);
      return;
    }
    if (transport === 'test-inbox' && process.env.NODE_ENV !== 'production') {
      if (!process.env.TEST_INBOX_DIR) throw new Error('TEST_INBOX_DIR requerido para pruebas.');
      await mkdir(process.env.TEST_INBOX_DIR, { recursive: true });
      const filename = (m.kind ? m.kind + '-' : '') + createHash('sha256').update(email.toLowerCase()).digest('hex') + '.json';
      await writeFile(
        join(process.env.TEST_INBOX_DIR, filename),
        JSON.stringify({ email, token, createdAt: new Date().toISOString() }),
        { mode: 0o600 },
      );
      return;
    }
    if (transport === 'firebase') {
      await m.firebase();
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
        subject: m.subject,
        text: m.text,
      }),
    });
    if (!response.ok)
      throw new Error(`No fue posible solicitar el correo (HTTP ${response.status}).`);
  }
}
