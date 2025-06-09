import axios from 'axios';
import { BASE_URL } from '@/config';
import { Cluster } from '@/prisma/client';

export function isClusterTokenPresent(getToken: (cluster: Cluster) => string, cluster: Cluster) {
  try {
    getToken(cluster);
    return true;
  } catch {
    return false;
  }
}

async function getClientCredentialsToken(tokenUrl: string, clientId: string, clientSecret: string, scope?: string) {
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  if (scope) params.append('scope', scope);

  const res = await axios.post(tokenUrl, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return res.data.access_token;
}

export async function validateClientCredentials(
  tokenUrl: string,
  clientId: string,
  clientSecret: string,
  scope?: string,
) {
  if (!(tokenUrl && clientId && clientSecret)) return false;
  const token = await getClientCredentialsToken(tokenUrl, clientId, clientSecret, scope);
  return Boolean(token);
}

export async function validateOAuthClientId(clientId: string) {
  const authUrl = `${process.env.AUTH_SERVER_URL}/realms/${process.env.AUTH_RELM}/protocol/openid-connect/auth`;

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    scope: 'openid',
    redirect_uri: BASE_URL,
    state: 'test',
    nonce: 'test',
  });

  const response = await axios.get(`${authUrl}?${params.toString()}`, {
    maxRedirects: 0,
    validateStatus: () => true,
  });

  return !response.status.toString().startsWith('4');
}
