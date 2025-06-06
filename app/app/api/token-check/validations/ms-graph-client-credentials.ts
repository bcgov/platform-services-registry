import { MS_GRAPH_API_CLIENT_ID, MS_GRAPH_API_CLIENT_SECRET, MS_GRAPH_API_AUTHORITY } from '@/config';
import { validateClientCredentials } from './helpers';

export async function validateMsGraphCredentials() {
  return await validateClientCredentials({
    tokenUrl: `${MS_GRAPH_API_AUTHORITY}/oauth2/v2.0/token`,
    clientId: MS_GRAPH_API_CLIENT_ID!,
    clientSecret: MS_GRAPH_API_CLIENT_SECRET!,
    scope: 'https://graph.microsoft.com/.default',
  });
}
