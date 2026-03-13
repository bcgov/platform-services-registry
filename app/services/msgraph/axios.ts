import axios from 'axios';
import {
  MS_GRAPH_API_URL,
  MS_GRAPH_API_PROXY_URL,
  USE_MS_GRAPH_API_PROXY,
  MS_GRAPH_API_TOKEN_ENDPOINT,
  MS_GRAPH_API_TENANT_ID,
  MS_GRAPH_API_CLIENT_ID,
  MS_GRAPH_API_CLIENT_SECRET,
  MS_GRAPH_API_CLIENT_PRIVATE_KEY,
  MS_GRAPH_API_CLIENT_CERTIFICATE,
} from '@/config';
import { getClientCredentialsToken, getMsGraphAccessTokenWithCertificate } from '@/utils/node/oauth2';

async function getAccessToken() {
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

    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
    config.headers.ConsistencyLevel = 'eventual';

    if (USE_MS_GRAPH_API_PROXY) {
      const { HttpsProxyAgent } = await import('https-proxy-agent');
      const graphAPIProxy = new HttpsProxyAgent(MS_GRAPH_API_PROXY_URL);
      config.httpAgent = graphAPIProxy;
      config.httpsAgent = graphAPIProxy;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
