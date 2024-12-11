import * as crypto from 'crypto';

export function generateShortId(length: number = 24): string {
  // Generate a buffer with random bytes
  const buffer = crypto.randomBytes(Math.ceil(length / 2));
  // Convert the buffer to a hexadecimal string and slice it to the desired length
  return buffer.toString('hex').slice(0, length);
}
