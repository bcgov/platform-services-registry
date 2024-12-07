import { ConfidentialClientApplication } from '@azure/msal-node';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { M365_PROXY_URL, USE_M365_PROXY } from '@/config';
import { logger } from '@/core/logging';
import msalConfig from './config';

let msalInstance!: ConfidentialClientApplication;

// See https://learn.microsoft.com/en-us/microsoft-cloud/dev/dev-proxy/how-to/use-dev-proxy-with-nodejs
const graphAPIProxy = USE_M365_PROXY ? new HttpsProxyAgent(M365_PROXY_URL) : null;

export async function getAccessToken() {
  const request = {
    scopes: ['https://graph.microsoft.com/.default'],
  };

  try {
    if (!msalInstance) {
      msalInstance = new ConfidentialClientApplication(msalConfig);
    }

    const response = await msalInstance.acquireTokenByClientCredential(request);
    return response?.accessToken;
  } catch (error) {
    logger.error('getAccessToken:', error);
    throw new Error('Error acquiring access token');
  }
}

export async function callMsGraph(endpoint: string, accessToken: string, options = {}) {
  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;

  headers.append('Authorization', bearer);
  headers.append('ConsistencyLevel', 'eventual');

  const defaultOptions: any = {
    method: 'GET',
    headers,
  };

  if (graphAPIProxy) {
    defaultOptions.agent = graphAPIProxy;
  }

  return fetch(endpoint, { ...defaultOptions, ...options });
}
