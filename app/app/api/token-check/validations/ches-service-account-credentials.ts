import { CHES_TOKEN_URL, CHES_CLIENT_ID, CHES_CLIENT_SECRET } from '@/config';
import { validateClientCredentials } from './helpers';

export async function validateChesServiceAccountCredentials() {
  const isChesServiceAccountCredentialsValid = await validateClientCredentials(
    CHES_TOKEN_URL,
    CHES_CLIENT_ID,
    CHES_CLIENT_SECRET,
  );

  return isChesServiceAccountCredentialsValid;
}
