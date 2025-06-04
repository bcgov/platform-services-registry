import { logger } from '@/core/logging';
import { getKcAdminClient } from '@/services/keycloak/app-realm';

export async function validateKeycloakServiceAccount() {
  try {
    await getKcAdminClient();
    logger.info('Keycloak admin credentials are valid');
    return true;
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error('Invalid Keycloak admin credentials:', error.message);
    } else {
      logger.error('Unexpected error', error);
    }
    return false;
  }
}
