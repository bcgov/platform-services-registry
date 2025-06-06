import { AUTH_RESOURCE, AUTH_SECRET } from '@/config';
import { validateClientCredentials } from './helpers';

export async function validateKeycloakUserLogin() {
  const tokenUrl = `${process.env.AUTH_SERVER_URL}/realms/${process.env.AUTH_RELM}/protocol/openid-connect/token`;

  return await validateClientCredentials({
    tokenUrl,
    clientId: AUTH_RESOURCE,
    clientSecret: AUTH_SECRET,
  });
}
