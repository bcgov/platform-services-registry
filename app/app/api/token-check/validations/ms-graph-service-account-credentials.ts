import { MS_GRAPH_API_TOKEN_ENDPOINT, MS_GRAPH_API_CLIENT_ID, MS_GRAPH_API_CLIENT_SECRET } from '@/config';
import { validateClientCredentials } from '@/utils/node/oauth2';

export async function validateMsGraphServiceAccountCredentials() {
  const isValid = await validateClientCredentials(
    MS_GRAPH_API_TOKEN_ENDPOINT,
    MS_GRAPH_API_CLIENT_ID,
    MS_GRAPH_API_CLIENT_SECRET,
    'https://graph.microsoft.com/.default',
  );

  return isValid;
}
