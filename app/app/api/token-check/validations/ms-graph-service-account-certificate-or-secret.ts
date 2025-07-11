import {
  MS_GRAPH_API_TENANT_ID,
  MS_GRAPH_API_CLIENT_ID,
  MS_GRAPH_API_CLIENT_SECRET,
  MS_GRAPH_API_CLIENT_PRIVATE_KEY,
  MS_GRAPH_API_CLIENT_CERTIFICATE,
  MS_GRAPH_API_TOKEN_ENDPOINT,
} from '@/config';
import { getMsGraphAccessTokenWithCertificate, getClientCredentialsToken } from '@/utils/node/oauth2';

export async function validateMsGraphServiceAccountCertificateOrSecret() {
  try {
    const token =
      MS_GRAPH_API_CLIENT_PRIVATE_KEY && MS_GRAPH_API_CLIENT_CERTIFICATE
        ? await getMsGraphAccessTokenWithCertificate(
            MS_GRAPH_API_TENANT_ID,
            MS_GRAPH_API_CLIENT_ID,
            MS_GRAPH_API_CLIENT_PRIVATE_KEY,
            MS_GRAPH_API_CLIENT_CERTIFICATE,
          )
        : await getClientCredentialsToken(
            MS_GRAPH_API_TOKEN_ENDPOINT,
            MS_GRAPH_API_CLIENT_ID,
            MS_GRAPH_API_CLIENT_SECRET,
            'https://graph.microsoft.com/.default',
          );

    return !!token;
  } catch {
    return false;
  }
}
