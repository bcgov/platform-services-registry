import axios, { AxiosRequestConfig } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import {
  USE_MS_GRAPH_API_PROXY,
  MS_GRAPH_API_PROXY_URL,
  MS_GRAPH_API_TOKEN_ENDPOINT,
  MS_GRAPH_API_CLIENT_ID,
  MS_GRAPH_API_CLIENT_SECRET,
} from '@/config';
import { getClientCredentialsToken } from '@/utils/node/oauth2';

const tokenUrl = MS_GRAPH_API_TOKEN_ENDPOINT;
const clientId = MS_GRAPH_API_CLIENT_ID;
const clientSecret = MS_GRAPH_API_CLIENT_SECRET;

// See https://learn.microsoft.com/en-us/microsoft-cloud/dev/dev-proxy/how-to/use-dev-proxy-with-nodejs
const graphAPIProxy = USE_MS_GRAPH_API_PROXY ? new HttpsProxyAgent(MS_GRAPH_API_PROXY_URL) : null;

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
