import { CHES_TOKEN_URL, CHES_CLIENT_ID, CHES_CLIENT_SECRET } from '@/config';
import { logger } from '@/core/logging';
import { getToken } from '@/services/ches/core';

export async function validateChesCredentials(): Promise<boolean> {
  if (!(CHES_TOKEN_URL && CHES_CLIENT_ID && CHES_CLIENT_SECRET)) {
    logger.error('Missing CHES environment variables');
    return false;
  }

  try {
    const token = await getToken({
      tokenUrl: CHES_TOKEN_URL,
      clientId: CHES_CLIENT_ID,
      clientSecret: CHES_CLIENT_SECRET,
    });

    const isValid = Boolean(token);
    logger[isValid ? 'info' : 'error'](`CHES credentials are ${isValid ? 'valid' : 'invalid or token fetch failed'}`);
    return isValid;
  } catch (error) {
    logger.error('Error validating CHES credentials:', error instanceof Error ? error.message : error);
    return false;
  }
}
