export interface TOTPOptions {
  timeStep?: number;
  digits?: number;
  algorithm?: 'SHA-1' | 'SHA-256' | 'SHA-512';
}

export interface HOTPOptions {
  digits?: number;
  algorithm?: 'SHA-1' | 'SHA-256' | 'SHA-512';
}

export interface ValidateOptions {
  timestamp?: Date | number;
  window?: number;
}
