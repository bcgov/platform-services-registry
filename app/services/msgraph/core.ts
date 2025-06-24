import axios, { AxiosRequestConfig } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { M365_PROXY_URL, USE_M365_PROXY } from '@/config';
import {
  IS_LOCAL,
  AUTH_RESOURCE,
  AUTH_SECRET,
  OIDC_AUTHORITY,
  MS_GRAPH_API_AUTHORITY,
  MS_GRAPH_API_CLIENT_ID,
  MS_GRAPH_API_CLIENT_SECRET,
} from '@/config';
import { getClientCredentialsToken } from '@/utils/node/oauth2';

const tokenUrl = IS_LOCAL
  ? `${OIDC_AUTHORITY}/protocol/openid-connect/token`
  : `${MS_GRAPH_API_AUTHORITY}/oauth2/v2.0/token`;
const clientId = IS_LOCAL ? AUTH_RESOURCE : MS_GRAPH_API_CLIENT_ID;
const clientSecret = IS_LOCAL ? AUTH_SECRET : MS_GRAPH_API_CLIENT_SECRET;

// See https://learn.microsoft.com/en-us/microsoft-cloud/dev/dev-proxy/how-to/use-dev-proxy-with-nodejs
const graphAPIProxy = USE_M365_PROXY ? new HttpsProxyAgent(M365_PROXY_URL) : null;

export async function getAccessToken() {
  const token = await getClientCredentialsToken(
    tokenUrl,
    clientId,
    clientSecret,
    'https://graph.microsoft.com/.default',
  );

  if (!token) {
    throw new Error('Failed to get access token');
  }

  return token;
}

export async function callMsGraph(endpoint: string, accessToken: string, options: AxiosRequestConfig = {}) {
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${accessToken}`,
    ConsistencyLevel: 'eventual',
  };

  const axiosOptions: AxiosRequestConfig = {
    method: 'GET',
    url: endpoint,
    headers,
    ...options,
    ...(graphAPIProxy && { httpAgent: graphAPIProxy, httpsAgent: graphAPIProxy }),
  };

  try {
    const res = await axios(axiosOptions);
    return res.data;
  } catch {
    return null;
  }
}
