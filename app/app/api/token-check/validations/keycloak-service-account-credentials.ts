import { KEYCLOAK_ADMIN_CLIENT_ID, KEYCLOAK_ADMIN_CLIENT_SECRET } from '@/config';
import { validateClientCredentials } from './helpers';

export async function validateKeycloakServiceAccount() {
  const tokenUrl = `${process.env.AUTH_SERVER_URL}/realms/${process.env.AUTH_RELM}/protocol/openid-connect/token`;
  const isKeycloakServiceAccountCredentialsValid = await validateClientCredentials(
    tokenUrl,
    KEYCLOAK_ADMIN_CLIENT_ID,
    KEYCLOAK_ADMIN_CLIENT_SECRET,
  );

  return isKeycloakServiceAccountCredentialsValid;
}
