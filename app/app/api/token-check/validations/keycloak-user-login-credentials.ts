import { AUTH_RESOURCE } from '@/config';
import { validateKeycloakUserClientId } from './helpers';

export async function validateKeycloakUserLogin() {
  return await validateKeycloakUserClientId(AUTH_RESOURCE);
}
