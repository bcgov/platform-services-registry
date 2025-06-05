import { CHES_TOKEN_URL, CHES_CLIENT_ID, CHES_CLIENT_SECRET } from '@/config';
import { validateClientCredentials } from './helpers';

export async function validateChesCredentials(): Promise<boolean> {
  if (!(CHES_TOKEN_URL && CHES_CLIENT_ID && CHES_CLIENT_SECRET)) return false;

  const token = await validateClientCredentials({
    tokenUrl: CHES_TOKEN_URL,
    clientId: CHES_CLIENT_ID,
    clientSecret: CHES_CLIENT_SECRET,
  });

  return Boolean(token);
}
