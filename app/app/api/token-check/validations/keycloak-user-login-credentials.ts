import { AUTH_RESOURCE } from '@/config';
import { validateOAuthClientId } from './helpers';

export async function validateKeycloakUserLogin() {
  const isValid = await validateOAuthClientId(AUTH_RESOURCE);
  return isValid;
}
