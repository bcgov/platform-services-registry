import { AUTH_SERVER_URL, AUTH_RELM, AUTH_RESOURCE, AUTH_SECRET } from '@/config';
import { validateClientCredentials } from './helpers';

export async function validateKeycloakUserLogin(): Promise<boolean> {
  if (!(AUTH_SERVER_URL && AUTH_RELM && AUTH_RESOURCE && AUTH_SECRET)) {
    return false;
  }

  const tokenUrl = `${AUTH_SERVER_URL}/realms/${AUTH_RELM}/protocol/openid-connect/token`;

  return Boolean(
    await validateClientCredentials({
      tokenUrl,
      clientId: AUTH_RESOURCE,
      clientSecret: AUTH_SECRET,
    }),
  );
}
