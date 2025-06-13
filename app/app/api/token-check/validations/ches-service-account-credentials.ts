import { CHES_TOKEN_URL, CHES_CLIENT_ID, CHES_CLIENT_SECRET } from '@/config';
import { validateClientCredentials } from '@/utils/node/oauth2';

export async function validateChesServiceAccountCredentials() {
  const isValid = await validateClientCredentials(CHES_TOKEN_URL, CHES_CLIENT_ID, CHES_CLIENT_SECRET);

  return isValid;
}
