import * as crypto from 'crypto';

/**
 * Generate x-hub-signature values for a webhook request.
 * @param body - The raw request body (as a string or buffer).
 * @param secret - The shared secret between the sender and receiver.
 * @returns An object containing both sha1 and sha256 signatures.
 */
export function generateHubSignatures(body: string | Buffer, secret: string) {
  const generateHmac = (algorithm: string) => {
    const hmac = crypto.createHmac(algorithm, secret);
    hmac.update(body);
    return hmac.digest('hex');
  };

  const sha1 = `sha1=${generateHmac('sha1')}`;
  const sha256 = `sha256=${generateHmac('sha256')}`;

  return { sha1, sha256 };
}

/**
 * Timing-safe comparison of two strings.
 * @param a - The first string.
 * @param b - The second string.
 * @returns A boolean indicating whether the strings are equal.
 */
function timingSafeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufferA, bufferB);
}

/**
 * Verify HMAC signatures (sha1 and sha256).
 * @param body - The raw request body (as a string or buffer).
 * @param secret - The shared secret between the sender and receiver.
 * @param receivedSignature - The signature to verify (e.g., "sha1=...").
 * @returns A boolean indicating if the signature is valid.
 */
export function verifyHubSignature(body: string | Buffer, secret: string, receivedSignature: string) {
  const [algorithm, receivedDigest] = receivedSignature.split('=');
  const hashAlgorithm = algorithm === 'sha1' ? 'sha1' : algorithm === 'sha256' ? 'sha256' : null;

  if (!hashAlgorithm) {
    throw new Error('Unsupported algorithm in signature');
  }

  const hmac = crypto.createHmac(hashAlgorithm, secret);
  hmac.update(body);
  const computedDigest = hmac.digest('hex');

  return timingSafeEqual(computedDigest, receivedDigest);
}

export function encodeBasicAuthorization(username: string, password: string) {
  const credentials = `${username}:${password}`;
  const base64Credentials = Buffer.from(credentials).toString('base64');
  return `Basic ${base64Credentials}`;
}
