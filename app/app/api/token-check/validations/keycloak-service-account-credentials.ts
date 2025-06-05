import { AUTH_SERVER_URL, AUTH_RELM, KEYCLOAK_ADMIN_CLIENT_ID, KEYCLOAK_ADMIN_CLIENT_SECRET } from '@/config';
import { validateClientCredentials } from './helpers';

export async function validateKeycloakServiceAccount(): Promise<boolean> {
  if (!(AUTH_SERVER_URL && AUTH_RELM && KEYCLOAK_ADMIN_CLIENT_ID && KEYCLOAK_ADMIN_CLIENT_SECRET)) return false;

  return Boolean(
    await validateClientCredentials({
      tokenUrl: `${AUTH_SERVER_URL}/realms/${AUTH_RELM}/protocol/openid-connect/token`,
      clientId: KEYCLOAK_ADMIN_CLIENT_ID,
      clientSecret: KEYCLOAK_ADMIN_CLIENT_SECRET,
    }),
  );
}
