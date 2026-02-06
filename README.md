# @krmeow/totp-auth

[![npm version](https://badge.fury.io/js/@krmeow/totp-auth.svg)](https://www.npmjs.com/package/@krmeow/totp-auth)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://github.com/krmeow/@krmeow/totp-auth/actions/workflows/ci.yml/badge.svg)](https://github.com/krmeow/@krmeow/totp-auth/actions)

基于 RFC 6238/4226 标准的 TOTP/HOTP 实现，兼容 Google Authenticator。

## 特性

- 完整的 TOTP/HOTP 实现
- TypeScript 支持
- 支持 SHA-1、SHA-256、SHA-512 算法
- 支持自定义时间步进和密码位数
- 支持时间窗口容错验证
- 同时输出 ESM 和 CommonJS 格式
- 零运行时依赖

## 安装

```bash
npm install @krmeow/totp-auth
```

## 快速开始

```typescript
import { TOTP } from '@krmeow/totp-auth';

// 1. 生成密钥
const secret = TOTP.generateSecret();
console.log('Secret:', secret);

// 2. 创建 TOTP 实例（使用 Base32 解码后的密钥）
const totp = new TOTP(TOTP.base32Decode(secret));

// 3. 生成验证码
const code = totp.generate();
console.log('Code:', code);

// 4. 验证（支持时间窗口容错）
const isValid = totp.verify(code, { window: 1 });
console.log('Valid:', isValid);

// 5. 获取验证码剩余有效时间
const remaining = totp.getRemainingSeconds();
console.log('Remaining seconds:', remaining);

// 6. 生成 Google Authenticator 扫码 URI
const uri = TOTP.generateAuthURI('user@example.com', secret, 'MyApp');
console.log('Auth URI:', uri);
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

- `timestamp`: 可选时间戳，默认当前时间

#### `verify(code, options?)`

验证验证码。

- `code`: 要验证的验证码
- `options`:
  - `timestamp`: 验证时间，默认当前时间
  - `window`: 容错窗口（前后几个时间步进），默认 1

#### `getRemainingSeconds(timestamp?)`

获取验证码剩余有效时间。

- `timestamp`: 可选时间戳，默认当前时间
- 返回: 剩余秒数

#### `TOTP.generateSecret(bytes?)`

生成随机密钥。

- `bytes`: 密钥字节数，默认 20
- 返回: Base32 编码的密钥字符串

#### `TOTP.generateAuthURI(account, secret, issuer?)`

生成 Google Authenticator 扫码 URI。

- `account`: 账户名（如邮箱）
- `secret`: Base32 编码的密钥
- `issuer`: 可选服务商名称
- 返回: otpauth:// URI 字符串

#### `TOTP.base32Decode(encoded)`

Base32 解码。

- `encoded`: Base32 编码的字符串
- 返回: `Uint8Array`

### HOTP 类

HOTP 是基于计数器的 OTP 实现，TOTP 基于 HOTP 构建。

#### `new HOTP(key, options?)`

创建 HOTP 实例。

#### `generate(counter)`

生成 HOTP 验证码。

- `counter`: 计数器值

#### `validate(code, counter, window?)`

验证 HOTP 验证码。

- 返回: `{ valid: boolean; counter?: number }`

### Base32 类

#### `Base32.encode(data)`

Base32 编码。

- `data`: `Uint8Array`
- 返回: Base32 编码字符串

#### `Base32.decode(encoded)`

Base32 解码。

- `encoded`: Base32 编码字符串
- 返回: `Uint8Array`

## 与 Google Authenticator 配合使用

```typescript
import { TOTP } from '@krmeow/totp-auth';

// 生成密钥
const secret = TOTP.generateSecret();

// 生成扫码 URI
const uri = TOTP.generateAuthURI('user@example.com', secret, 'MyApp');

// 将 uri 生成二维码，用户扫描后即可在 Google Authenticator 中使用
```

## 浏览器环境使用

```javascript
// ESM
import { TOTP } from '@krmeow/totp-auth';

// 或使用 CDN
import { TOTP } from 'https://cdn.jsdelivr.net/npm/@krmeow/totp-auth/dist/index.esm.js';

const secret = TOTP.generateSecret();
const totp = new TOTP(TOTP.base32Decode(secret));
const code = totp.generate();
console.log(code);
```

## 测试向量

本库使用 RFC 6238 标准测试向量验证（使用 8 位验证码）：

| 时间戳 | 预期验证码 |
|--------|-----------|
| 59 秒 | 94287082 |
| 1111111109 秒 | 07081804 |
| 1111111111 秒 | 14050471 |
| 1234567890 秒 | 89005924 |
| 2000000000 秒 | 69279037 |

> **注意**：RFC 6238 标准测试向量使用 8 位验证码。实际使用中（如 Google Authenticator），默认使用 **6 位验证码**，这也是本库的默认值。

## 构建

```bash
# 安装依赖
npm install

# 运行测试
npm test

# 构建
npm run build
```

## 发布

```bash
npm login
npm publish
```

## 许可证

MIT License - see [LICENSE](LICENSE) 文件
