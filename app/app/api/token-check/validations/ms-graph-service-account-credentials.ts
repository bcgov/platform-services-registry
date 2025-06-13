import { MS_GRAPH_API_CLIENT_ID, MS_GRAPH_API_CLIENT_SECRET, MS_GRAPH_API_AUTHORITY } from '@/config';
import { validateClientCredentials } from '@/utils/node/oauth2';

export async function validateMsGraphServiceAccountCredentials() {
  const isValid = await validateClientCredentials(
    `${MS_GRAPH_API_AUTHORITY}/oauth2/v2.0/token`,
    MS_GRAPH_API_CLIENT_ID,
    MS_GRAPH_API_CLIENT_SECRET,
    'https://graph.microsoft.com/.default',
  );

  return isValid;
}
