import { ConfidentialClientApplication } from '@azure/msal-node';
import fetch, { Headers } from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import msalConfig from './config';

let msalInstance;
const graphAPIProxy = process.env.APP_ENV === 'localdev' ? new HttpsProxyAgent(process.env.M365_PROXY_URL) : null;

export async function getAccessToken() {
  const request = {
    scopes: ['https://graph.microsoft.com/.default'],
  };

  try {
    if (!msalInstance) {
      msalInstance = new ConfidentialClientApplication(msalConfig);
    }

    const response = await msalInstance.acquireTokenByClientCredential(request);
    return response.accessToken;
  } catch (error) {
    console.error(error);
    throw new Error('Error acquiring access token');
  }
}

export async function callMsGraph(endpoint, accessToken, options = {}) {
  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;

  headers.append('Authorization', bearer);
  headers.append('ConsistencyLevel', 'eventual');

  const defaultOptions = {
    method: 'GET',
    headers,
    agent: graphAPIProxy,
  };

  return fetch(endpoint, { ...defaultOptions, ...options });
}
