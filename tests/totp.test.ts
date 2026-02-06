import { TOTP, Base32 } from '../src';

describe('TOTP', () => {
  const testKey = Base32.decode('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ');
  
  test('should generate correct TOTP codes', () => {
    const totp = new TOTP(testKey, { digits: 8 });
    
    expect(totp.generate(new Date(1000 * 59))).toBe('94287082');
    expect(totp.generate(new Date(1000 * 1111111109))).toBe('07081804');
    expect(totp.generate(new Date(1000 * 1111111111))).toBe('14050471');
    expect(totp.generate(new Date(1000 * 1234567890))).toBe('89005924');
    expect(totp.generate(new Date(1000 * 2000000000))).toBe('69279037');
  });

  test('should validate codes within window', () => {
    const totp = new TOTP(testKey);
    const code = totp.generate();
    
    expect(totp.verify(code)).toBe(true);
    expect(totp.verify('000000')).toBe(false);
  });

  test('should generate valid Base32 secret', () => {
    const secret = TOTP.generateSecret();
    expect(secret.length).toBe(32);
    expect(() => Base32.decode(secret)).not.toThrow();
  });

  test('should generate correct auth URI', () => {
    const uri = TOTP.generateAuthURI('user@example.com', 'SECRET123', 'MyApp');
    expect(uri).toContain('otpauth://totp/');
    expect(uri).toContain('secret=SECRET123');
    expect(uri).toContain('issuer=MyApp');
  });
});
