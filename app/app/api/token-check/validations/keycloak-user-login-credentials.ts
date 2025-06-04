import { AUTH_SERVER_URL, AUTH_RELM, AUTH_RESOURCE, AUTH_SECRET } from '@/config';
import { logger } from '@/core/logging';

export async function validateKeycloakUserLogin() {
  const tokenUrl = `${AUTH_SERVER_URL}/realms/${AUTH_RELM}/protocol/openid-connect/token`;

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: AUTH_RESOURCE!,
    client_secret: AUTH_SECRET!,
  });

  try {
    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!res.ok) {
      logger.error(`Failed to validate client credentials:`, res.status, await res.text());
      return false;
    }

    const { access_token } = await res.json();
    return typeof access_token === 'string';
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error during token fetch:`, error.message);
    } else {
      logger.error('Unexpected error', error);
    }
    return false;
  }
}
