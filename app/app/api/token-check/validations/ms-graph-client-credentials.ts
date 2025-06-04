import { ConfidentialClientApplication } from '@azure/msal-node';
import { logger } from '@/core/logging';
import msalConfig from '@/services/msgraph/config';

export async function validateMsGraphCredentials(): Promise<boolean> {
  try {
    const msalInstance = new ConfidentialClientApplication(msalConfig);

    const result = await msalInstance.acquireTokenByClientCredential({
      scopes: ['https://graph.microsoft.com/.default'],
    });

    const isValid = Boolean(result?.accessToken);
    logger[isValid ? 'info' : 'error'](
      `MS Graph credentials are ${isValid ? 'valid' : 'invalid or token fetch failed'}`,
    );

    return isValid;
  } catch (error) {
    logger.error('Error validating MS Graph credentials:', error instanceof Error ? error.message : error);
    return false;
  }
}
