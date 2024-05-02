import { ConfidentialClientApplication } from '@azure/msal-node';
import fetch, { Headers, RequestInit } from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import msalConfig from './config';
import { IS_LOCAL, M365_PROXY_URL } from '@/config';
import { logger } from '@/core/logging';

let msalInstance!: ConfidentialClientApplication;
const graphAPIProxy = IS_LOCAL ? new HttpsProxyAgent(M365_PROXY_URL) : null;

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

  const defaultOptions: RequestInit = {
    method: 'GET',
    headers,
  };

  if (graphAPIProxy) {
    defaultOptions.agent = graphAPIProxy;
  }

  return fetch(endpoint, { ...defaultOptions, ...options });
}
