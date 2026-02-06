import { HOTP } from './hotp';
import { TOTPOptions, ValidateOptions } from './types';
import { Base32 } from './base32';

export class TOTP extends HOTP {
  private timeStep: number;

  constructor(key: Uint8Array, options: TOTPOptions = {}) {
    super(key, options);
    this.timeStep = options.timeStep || 30;
  }

  generate(timestamp: Date | number = new Date()): string {
    const time = Math.floor(
      (timestamp instanceof Date ? timestamp.getTime() : timestamp) / 1000 / this.timeStep
    );
    return super.generate(time);
  }

  verify(code: string | number, options: ValidateOptions = {}): boolean {
    const timestamp = options.timestamp || new Date();
    const window = options.window ?? 1;
    const codeStr = String(code).padStart(this.digits, '0');

    const baseTime = timestamp instanceof Date ? timestamp.getTime() : timestamp;

    for (let i = -window; i <= window; i++) {
      const checkTime = new Date(baseTime + (i * this.timeStep * 1000));
      if (this.generate(checkTime) === codeStr) {
        return true;
      }
    }
    return false;
  }

  getRemainingSeconds(timestamp: Date | number = new Date()): number {
    const time = timestamp instanceof Date ? timestamp.getTime() : timestamp;
    return this.timeStep - (Math.floor(time / 1000) % this.timeStep);
  }

  static generateSecret(bytes: number = 20): string {
    const randomBytes = new Uint8Array(bytes);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(randomBytes);
    } else {
      const { randomBytes: nodeRandom } = require('crypto');
      nodeRandom(randomBytes);
    }
    return Base32.encode(randomBytes);
  }

  static generateAuthURI(account: string, secret: string, issuer?: string): string {
    const params = new URLSearchParams();
    params.set('secret', secret);
    if (issuer) {
      params.set('issuer', issuer);
    }
    const label = issuer ? `${issuer}:${account}` : account;
    return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`;
  }

  static base32Decode = Base32.decode;
}
