import { Injectable, Optional } from '@nestjs/common';

/**
 * Firebase is a DELIVERY adapter only. Identity, verification tokens and the
 * verified state remain in PostgreSQL. This adapter queues a mail document
 * that the official Firebase Trigger Email extension delivers via SMTP.
 * Writing to Firestore is NOT proof that the SMTP message was delivered.
 */
export interface FirebaseMailMessage {
  to: string;
  message: { subject: string; text: string };
  expireAt: Date;
}

export type FirebaseMailWriter = (
  collection: string,
  message: FirebaseMailMessage,
) => Promise<void>;

/** Pure configuration validation — no credentials, tokens or URLs in errors. */
export function readFirebaseMailConfig(env: NodeJS.ProcessEnv = process.env): {
  projectId: string;
  collection: string;
  clientEmail?: string;
  privateKey?: string;
  credentialsFile?: string;
} {
  const projectId = env.FIREBASE_PROJECT_ID?.trim() || '';
  const collection = env.FIREBASE_MAIL_COLLECTION?.trim() || 'mail';
  const clientEmail = env.FIREBASE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').trim();
  const credentialsFile = env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (!projectId) throw new Error('Firebase: configura FIREBASE_PROJECT_ID.');
  if (!/^[A-Za-z0-9_-]+$/.test(collection))
    throw new Error('Firebase: FIREBASE_MAIL_COLLECTION debe ser un nombre simple de colección.');
  if (!credentialsFile && (!clientEmail || !privateKey))
    throw new Error('Firebase: configura GOOGLE_APPLICATION_CREDENTIALS o FIREBASE_SERVICE_ACCOUNT_EMAIL junto con FIREBASE_PRIVATE_KEY.');
  if (!credentialsFile && (!clientEmail?.endsWith('.gserviceaccount.com') || !privateKey?.includes('BEGIN PRIVATE KEY')))
    throw new Error('Firebase: formato inválido de credenciales de cuenta de servicio.');
  return { projectId, collection, clientEmail, privateKey, credentialsFile };
}

/**
 * Deferred SDK initialization avoids external work at module load time and
 * reuses the same named Firebase app for concurrent requests.
 */
export async function createFirebaseMailWriter(
  env: NodeJS.ProcessEnv = process.env,
): Promise<FirebaseMailWriter> {
  const config = readFirebaseMailConfig(env);
  const { applicationDefault, cert, getApps, initializeApp } = await import('firebase-admin/app');
  const { getFirestore } = await import('firebase-admin/firestore');
  const appName = 'qapath-verification-mail';
  const app = getApps().find(item => item.name === appName) ?? initializeApp(
    {
      projectId: config.projectId,
      credential: config.credentialsFile
        ? applicationDefault()
        : cert({
            projectId: config.projectId,
            clientEmail: config.clientEmail!,
            privateKey: config.privateKey!,
          }),
    },
    appName,
  );
  const firestore = getFirestore(app);
  return async (collection, doc) => {
    await firestore.collection(collection).add(doc);
  };
}

@Injectable()
export class FirebaseEmailAdapter {
  private writerPromise?: Promise<FirebaseMailWriter>;

  constructor(@Optional() private readonly overrideWriter?: FirebaseMailWriter) {}

  /** Queues a verification email, not a Firebase Auth verification link. */
  async queueVerification(email: string, verificationLink: string): Promise<void> {
    await this.queueMessage(
      email,
      'Confirma tu correo — QAPath Academy',
      `Confirma tu cuenta de QAPath Academy abriendo este enlace dentro de 24 horas:\n\n${verificationLink}\n\nSi no solicitaste esta cuenta, ignora este mensaje.`,
    );
  }

  /** Queues any transactional message with a one-use link (verification or MFA reset). */
  async queueMessage(email: string, subject: string, text: string): Promise<void> {
    const collection = readFirebaseMailConfig().collection;
    if (!this.writerPromise) {
      this.writerPromise = this.overrideWriter
        ? Promise.resolve(this.overrideWriter)
        : createFirebaseMailWriter();
    }
    const writer = await this.writerPromise.catch(error => {
      // Allow a subsequent attempt after transient initialization failures.
      this.writerPromise = undefined;
      throw error;
    });
    await writer(collection, {
      to: email,
      message: { subject, text },
      // The collection contains a one-use verification URL. Configure a
      // Firestore TTL policy for expireAt to remove processed mail documents.
      expireAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    });
  }
}
