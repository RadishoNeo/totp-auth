 我来帮你创建一个可以发布到 npm 的 TOTP 库。这是一个完整的项目结构，包含 TypeScript 支持、测试和发布配置。

## 项目结构

```
totp-js/
├── src/
│   ├── index.ts          # 主入口
│   ├── totp.ts           # TOTP 核心实现
│   ├── hotp.ts           # HOTP 基础实现
│   ├── base32.ts         # Base32 编解码
│   └── types.ts          # 类型定义
├── tests/
│   └── totp.test.ts      # 测试用例
├── dist/                 # 编译输出
├── package.json
├── tsconfig.json
├── rollup.config.js
└── README.md
```

## 完整代码

### 1. `package.json`

```json
{
  "name": "totp-auth",
  "version": "1.0.0",
  "description": "Time-based One-Time Password (TOTP) implementation for Node.js and browsers",
  "main": "dist/index.cjs",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "rollup -c",
    "test": "jest",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "totp",
    "hotp",
    "otp",
    "2fa",
    "two-factor",
    "authentication",
    "google-authenticator",
    "rfc6238",
    "rfc4226"
  ],
  "author": "你的名字",
  "license": "MIT",
  "devDependencies": {
    "@rollup/plugin-typescript": "^11.1.5",
    "@types/jest": "^29.5.8",
    "@types/node": "^20.9.0",
    "jest": "^29.7.0",
    "rollup": "^4.5.0",
    "ts-jest": "^29.1.1",
    "tslib": "^2.6.2",
    "typescript": "^5.2.2"
  }
}
```

### 2. `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### 3. `rollup.config.js`

```javascript
import typescript from '@rollup/plugin-typescript';

export default [
  // ES Module 版本
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'es'
    },
    plugins: [typescript({ tsconfig: './tsconfig.json' })]
  },
  // CommonJS 版本
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.cjs',
      format: 'cjs'
    },
    plugins: [typescript({ tsconfig: './tsconfig.json' })]
  }
];
```

### 4. `src/types.ts`

```typescript
export interface TOTPOptions {
  /** 时间步进（秒），默认 30 */
  timeStep?: number;
  /** 密码位数，默认 6 */
  digits?: number;
  /** 哈希算法，默认 'SHA-1' */
  algorithm?: 'SHA-1' | 'SHA-256' | 'SHA-512';
}

export interface HOTPOptions {
  /** 密码位数，默认 6 */
  digits?: number;
  /** 哈希算法，默认 'SHA-1' */
  algorithm?: 'SHA-1' | 'SHA-256' | 'SHA-512';
}

export interface ValidateOptions {
  /** 验证时间，默认当前时间 */
  timestamp?: Date | number;
  /** 容错窗口（前后几个时间步进），默认 1 */
  window?: number;
}
```

### 5. `src/base32.ts`

```typescript
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export class Base32 {
  static encode(data: Uint8Array): string {
    let bits = 0;
    let value = 0;
    let output = '';

    for (let i = 0; i < data.length; i++) {
      value = (value << 8) | data[i];
      bits += 8;

      while (bits >= 5) {
        output += ALPHABET[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }

    if (bits > 0) {
      output += ALPHABET[(value << (5 - bits)) & 31];
    }

    while (output.length % 8 !== 0) {
      output += '=';
    }

    return output;
  }

  static decode(encoded: string): Uint8Array {
    const cleaned = encoded.replace(/=+$/, '').toUpperCase();
    let bits = 0;
    let value = 0;
    const output: number[] = [];

    for (let i = 0; i < cleaned.length; i++) {
      const val = ALPHABET.indexOf(cleaned[i]);
      if (val === -1) throw new Error('Invalid Base32 character');
      
      value = (value << 5) | val;
      bits += 5;

      if (bits >= 8) {
        output.push((value >>> (bits - 8)) & 0xff);
        bits -= 8;
      }
    }

    return new Uint8Array(output);
  }
}
```

### 6. `src/hotp.ts`

```typescript
import { createHmac } from 'crypto';
import { HOTPOptions } from './types';

export class HOTP {
  protected key: Uint8Array;
  protected digits: number;
  protected algorithm: string;

  constructor(key: Uint8Array, options: HOTPOptions = {}) {
    this.key = key;
    this.digits = options.digits || 6;
    this.algorithm = (options.algorithm || 'SHA-1').replace('-', '');
  }

  /**
   * 生成 HOTP 码
   * @param counter - 计数器值
   * @returns 生成的验证码
   */
  generate(counter: number): string {
    // 将计数器转为 8 字节 Big-Endian
    const buffer = Buffer.alloc(8);
    const high = Math.floor(counter / 0x100000000);
    const low = counter >>> 0;
    buffer.writeUInt32BE(high, 0);
    buffer.writeUInt32BE(low, 4);

    // 计算 HMAC
    const hmac = createHmac(this.algorithm, this.key);
    hmac.update(buffer);
    const hash = hmac.digest();

    // 动态截断
    const offset = hash[hash.length - 1] & 0x0f;
    const binary = 
      ((hash[offset] & 0x7f) << 24) |
      ((hash[offset + 1] & 0xff) << 16) |
      ((hash[offset + 2] & 0xff) << 8) |
      (hash[offset + 3] & 0xff);

    // 取模
    const otp = binary % Math.pow(10, this.digits);
    return String(otp).padStart(this.digits, '0');
  }

  /**
   * 验证 HOTP 码
   * @param code - 要验证的码
   * @param counter - 当前计数器
   * @param window - 向前搜索的窗口大小
   * @returns 验证结果及匹配时的计数器
   */
  validate(code: string | number, counter: number, window: number = 0): { valid: boolean; counter?: number } {
    const codeStr = String(code).padStart(this.digits, '0');

    for (let i = 0; i <= window; i++) {
      if (this.generate(counter + i) === codeStr) {
        return { valid: true, counter: counter + i };
      }
    }

    return { valid: false };
  }
}
```

### 7. `src/totp.ts`

```typescript
import { HOTP } from './hotp';
import { TOTPOptions, ValidateOptions } from './types';
import { Base32 } from './base32';

export class TOTP extends HOTP {
  private timeStep: number;

  constructor(key: Uint8Array, options: TOTPOptions = {}) {
    super(key, options);
    this.timeStep = options.timeStep || 30;
  }

  /**
   * 生成当前时间的 TOTP 码
   * @param timestamp - 可选时间戳，默认当前时间
   * @returns 生成的验证码
   */
  generate(timestamp: Date | number = new Date()): string {
    const time = Math.floor(
      (timestamp instanceof Date ? timestamp.getTime() : timestamp) / 1000 / this.timeStep
    );
    return super.generate(time);
  }

  /**
   * 验证 TOTP 码（支持时间窗口容错）
   * @param code - 要验证的验证码
   * @param options - 验证选项
   * @returns 是否验证通过
   */
  validate(code: string | number, options: ValidateOptions = {}): boolean {
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

  /**
   * 获取剩余有效时间（秒）
   * @param timestamp - 可选时间戳
   * @returns 剩余秒数
   */
  getRemainingSeconds(timestamp: Date | number = new Date()): number {
    const time = timestamp instanceof Date ? timestamp.getTime() : timestamp;
    return this.timeStep - (Math.floor(time / 1000) % this.timeStep);
  }

  /**
   * 生成随机密钥
   * @param bytes - 密钥字节数，默认 20
   * @returns Base32 编码的密钥
   */
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

  /**
   * 生成 Google Authenticator URI
   * @param account - 账户名
   * @param secret - Base32 编码的密钥
   * @param issuer - 服务商名称
   * @returns otpauth URI
   */
  static generateAuthURI(account: string, secret: string, issuer?: string): string {
    const params = new URLSearchParams();
    params.set('secret', secret);
    if (issuer) {
      params.set('issuer', issuer);
    }
    const label = issuer ? `${issuer}:${account}` : account;
    return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`;
  }

  /**
   * Base32 解码
   */
  static base32Decode = Base32.decode;
}
```

### 8. `src/index.ts`

```typescript
export { TOTP } from './totp';
export { HOTP } from './hotp';
export { Base32 } from './base32';
export * from './types';
```

### 9. `tests/totp.test.ts`

```typescript
import { TOTP, Base32 } from '../src';

describe('TOTP', () => {
  // 测试向量来自 RFC 6238
  const testKey = Base32.decode('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ'); // "12345678901234567890" 的 Base32
  
  test('should generate correct TOTP codes', () => {
    const totp = new TOTP(testKey);
    
    // 测试特定时间戳
    expect(totp.generate(new Date(1000 * 59))).toBe('94287082');
    expect(totp.generate(new Date(1000 * 1111111109))).toBe('07081804');
    expect(totp.generate(new Date(1000 * 1111111111))).toBe('14050471');
    expect(totp.generate(new Date(1000 * 1234567890))).toBe('89005924');
    expect(totp.generate(new Date(1000 * 2000000000))).toBe('69279037');
  });

  test('should validate codes within window', () => {
    const totp = new TOTP(testKey);
    const code = totp.generate();
    
    expect(totp.validate(code)).toBe(true);
    expect(totp.validate('000000')).toBe(false);
  });

  test('should generate valid Base32 secret', () => {
    const secret = TOTP.generateSecret();
    expect(secret.length).toBe(32); // 20字节 = 32个Base32字符
    expect(() => Base32.decode(secret)).not.toThrow();
  });

  test('should generate correct auth URI', () => {
    const uri = TOTP.generateAuthURI('user@example.com', 'SECRET123', 'MyApp');
    expect(uri).toContain('otpauth://totp/');
    expect(uri).toContain('secret=SECRET123');
    expect(uri).toContain('issuer=MyApp');
  });
});
```

### 10. `jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts']
};
```

### 11. `README.md`

```markdown
# totp-auth

[![npm version](https://badge.fury.io/js/totp-auth.svg)](https://www.npmjs.com/package/totp-auth)

基于 RFC 6238/4226 标准的 TOTP/HOTP 实现，兼容 Google Authenticator。

## 安装

```bash
npm install totp-auth
```

## 快速开始

```typescript
import { TOTP } from 'totp-auth';

// 1. 生成密钥
const secret = TOTP.generateSecret();
console.log('Secret:', secret);

// 2. 创建 TOTP 实例（使用 Base32 解码后的密钥）
const totp = new TOTP(TOTP.base32Decode(secret));

// 3. 生成验证码
const code = totp.generate();
console.log('Code:', code);

// 4. 验证（支持时间窗口容错）
const isValid = totp.validate(code, { window: 1 });
console.log('Valid:', isValid);
```

## API

### TOTP 类

#### `new TOTP(key, options?)`

创建 TOTP 实例。

- `key`: `Uint8Array` - Base32 解码后的密钥
- `options`:
  - `timeStep`: 时间步进（秒），默认 30
  - `digits`: 验证码位数，默认 6
  - `algorithm`: 哈希算法，默认 'SHA-1'

#### `generate(timestamp?)`

生成验证码。

#### `validate(code, options?)`

验证验证码。

- `code`: 要验证的验证码
- `options`:
  - `timestamp`: 验证时间
  - `window`: 容错窗口（前后几个时间步进）

#### `TOTP.generateSecret(bytes?)`

生成随机密钥（Base32 格式）。

#### `TOTP.generateAuthURI(account, secret, issuer?)`

生成 Google Authenticator 扫码 URI。

#### `TOTP.base32Decode(encoded)`

Base32 解码。

## 许可证

MIT
```

## 发布步骤

1. **安装依赖**
   ```bash
   npm install
   ```

2. **运行测试**
   ```bash
   npm test
   ```

3. **构建**
   ```bash
   npm run build
   ```

4. **登录 npm**（如果没有账号先注册）
   ```bash
   npm login
   ```

5. **发布**（确保包名全局唯一）
   ```bash
   npm publish
   ```

如果包名 `totp-auth` 被占用，修改 `package.json` 中的 `name` 字段为其他名称，如 `@你的用户名/totp-auth`。

发布后别人可以通过 `npm install totp-auth` 安装使用。