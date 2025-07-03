import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import {
  MS_GRAPH_API_URL,
  MS_GRAPH_API_PROXY_URL,
  USE_MS_GRAPH_API_PROXY,
  MS_GRAPH_API_TOKEN_ENDPOINT,
  MS_GRAPH_API_CLIENT_ID,
  MS_GRAPH_API_CLIENT_SECRET,
} from '@/config';
import { getClientCredentialsToken } from '@/utils/node/oauth2';

// See https://learn.microsoft.com/en-us/microsoft-cloud/dev/dev-proxy/how-to/use-dev-proxy-with-nodejs
const graphAPIProxy = USE_MS_GRAPH_API_PROXY ? new HttpsProxyAgent(MS_GRAPH_API_PROXY_URL) : null;

async function getAccessToken() {
  const token = await getClientCredentialsToken(
    MS_GRAPH_API_TOKEN_ENDPOINT,
    MS_GRAPH_API_CLIENT_ID,
    MS_GRAPH_API_CLIENT_SECRET,
    'https://graph.microsoft.com/.default',
  );

  if (!token) {
    throw new Error('Failed to get access token');
  }

  return token;
}

export const instance = axios.create({
  baseURL: `${MS_GRAPH_API_URL}/v1.0`,
  timeout: 0,
  withCredentials: true,
});

instance.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();

    if (token) {
      // Ensure config.headers exists, then add the Authorization header
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      config.headers.ConsistencyLevel = 'eventual';
    }

    if (graphAPIProxy) {
      // If using a proxy, ensure the axios instance uses the proxy agent
      config.httpAgent = graphAPIProxy;
      config.httpsAgent = graphAPIProxy;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
