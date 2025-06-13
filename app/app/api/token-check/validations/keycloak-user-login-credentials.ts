import { AUTH_RESOURCE, AUTH_SERVER_URL, AUTH_RELM, BASE_URL } from '@/config';
import { validateOAuthClientId } from '@/utils/node/oauth2';

export async function validateKeycloakUserLogin() {
  const authUrl = `${AUTH_SERVER_URL}/realms/${AUTH_RELM}/protocol/openid-connect/auth`;
  const isValid = await validateOAuthClientId(authUrl, AUTH_RESOURCE, BASE_URL);

  return isValid;
}
