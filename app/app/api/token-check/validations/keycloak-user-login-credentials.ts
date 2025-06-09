import { AUTH_RESOURCE } from '@/config';
import { validateOAuthClientId } from './helpers';

export async function validateKeycloakUserLogin() {
  const isKeycloakUserLoginTokenValid = await validateOAuthClientId(AUTH_RESOURCE);
  return isKeycloakUserLoginTokenValid;
}
