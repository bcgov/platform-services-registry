import { ClientCertificateCredential } from '@azure/identity';
import axios from 'axios';

export async function getClientCredentialsToken(
  tokenUrl: string,
  clientId: string,
  clientSecret: string,
  scope?: string,
) {
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  if (scope) {
    params.append('scope', scope);
  }

  const response = await axios.post<{ access_token?: string }>(tokenUrl, params.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    timeout: 5000,
  });

  return response.data.access_token;
}

export async function getMsGraphAccessTokenWithCertificate(
  tenantId: string,
  clientId: string,
  privateKey: string,
  certificate: string,
) {
  if (!certificate.includes('BEGIN CERTIFICATE') || !privateKey.includes('BEGIN PRIVATE KEY')) {
    throw new Error('Missing certificate or private key format');
  }

  const certificateWithKeyPem = `${certificate.trim()}\n${privateKey.trim()}`;
  const credential = new ClientCertificateCredential(tenantId, clientId, { certificate: certificateWithKeyPem });

  const accessToken = await credential.getToken('https://graph.microsoft.com/.default');
  return accessToken.token;
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

export async function validateOAuthClientId(authUrl: string, clientId: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    scope: 'openid',
    redirect_uri: redirectUri,
    state: 'test_state',
    nonce: 'test_nonce',
  });

  const response = await axios.get<string>(`${authUrl}?${params.toString()}`, {
    timeout: 5000,
    maxRedirects: 0,
    validateStatus: () => true,
  });

  return response.status < 400;
}
