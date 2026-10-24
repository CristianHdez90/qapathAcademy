
import { Injectable } from '@nestjs/common';
import {
  createHash,
  randomBytes,
  scrypt,
  timingSafeEqual,
} from 'node:crypto';

import type {
  PasswordPort,
  TokenPort,
} from '@qapath/identity';

@Injectable()
export class CryptoAuthAdapter implements PasswordPort {
  private derive(password: string, salt: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      scrypt(
        password,
        salt,
        32,
        {
          N: 1 << 15,
          r: 8,
          p: 1,
          maxmem: 64 * 1024 * 1024,
        },
        (error, derivedKey) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(derivedKey);
        },
      );
    });
  }

  async hash(password: string): Promise<string> {
    const salt = randomBytes(16);
    const hash = await this.derive(password, salt);

    return `scrypt-v1:${salt.toString('hex')}:${hash.toString('hex')}`;
  }

  async verify(password: string, record: string): Promise<boolean> {
    const parts = record.split(':');

    const plausible =
      parts.length === 3 &&
      parts[0] === 'scrypt-v1' &&
      /^[a-f0-9]{32}$/.test(parts[1]) &&
      /^[a-f0-9]{64}$/.test(parts[2]);

    const salt = plausible
      ? Buffer.from(parts[1], 'hex')
      : Buffer.alloc(16);

    const actual = await this.derive(password, salt);

    const expected = plausible
      ? Buffer.from(parts[2], 'hex')
      : Buffer.alloc(32);

    return plausible && timingSafeEqual(actual, expected);
  }

  issue(): string {
    return randomBytes(32).toString('base64url');
  }

  hashToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }
}

export class SecureTokensAdapter implements TokenPort {
  constructor(private readonly crypto: CryptoAuthAdapter) {}

  issue(): string {
    return this.crypto.issue();
  }

  hash(raw: string): string {
    return this.crypto.hashToken(raw);
  }
}
