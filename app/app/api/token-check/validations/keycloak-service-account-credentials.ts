import { KEYCLOAK_ADMIN_CLIENT_ID, KEYCLOAK_ADMIN_CLIENT_SECRET } from '@/config';
import { validateClientCredentials } from './helpers';

export async function validateKeycloakServiceAccount() {
  const tokenUrl = `${process.env.AUTH_SERVER_URL}/realms/${process.env.AUTH_RELM}/protocol/openid-connect/token`;

  return await validateClientCredentials({
    tokenUrl: tokenUrl,
    clientId: KEYCLOAK_ADMIN_CLIENT_ID,
    clientSecret: KEYCLOAK_ADMIN_CLIENT_SECRET,
  });
}
