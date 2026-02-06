const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export class Base32 {
  static encode(data: Uint8Array): string {
    let bits = 0;
    let value = 0;
    let output = "";

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
      output += "=";
    }

    return output;
  }

  static decode(encoded: string): Uint8Array {
    const cleaned = encoded.replace(/=+$/, "").toUpperCase();
    let bits = 0;
    let value = 0;
    const output: number[] = [];

    for (let i = 0; i < cleaned.length; i++) {
      const val = ALPHABET.indexOf(cleaned[i]);
      if (val === -1) throw new Error("Invalid Base32 character");

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
