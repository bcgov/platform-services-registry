import KcAdminClient from '@keycloak/keycloak-admin-client';
import { AuthorizationV1Api } from '@kubernetes/client-node';
import { KEYCLOAK_ADMIN_CLIENT_ID, KEYCLOAK_ADMIN_CLIENT_SECRET } from '@/config';
import { Cluster } from '@/prisma/client';
import { configureKubeConfig } from '@/services/k8s/helpers';

export async function validateK8sToken(cluster: Cluster, token: string): Promise<boolean> {
  try {
    const kc = configureKubeConfig(cluster, token);
    const authClient = kc.makeApiClient(AuthorizationV1Api);
    const res = await authClient.getAPIResources();
    return Array.isArray(res.resources) && res.resources.length > 0;
  } catch {
    return false;
  }
}

export interface TokenData {
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  scope?: string;
}

async function getClientCredentialsToken(tokenUrl: string, params: URLSearchParams) {
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function validateClientCredentials({ tokenUrl, clientId, clientSecret, scope }: TokenData) {
  if (!(tokenUrl && clientId && clientSecret)) return false;

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  if (scope) params.append('scope', scope);

  const token = await getClientCredentialsToken(tokenUrl, params);
  return Boolean(token);
}

export async function validateKeycloakUserClientId(clientId: string) {
  try {
    const authUrl = `${process.env.AUTH_SERVER_URL}/realms/${process.env.AUTH_RELM}/protocol/openid-connect/auth`;

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      scope: 'openid profile email',
      redirect_uri: 'https://registry.developer.gov.bc.ca/',
      state: 'test',
      nonce: 'test',
    });

    const res = await fetch(`${authUrl}?${params.toString()}`, {
      method: 'GET',
      redirect: 'manual',
    });

    return res.status === 200 || res.status === 302;
  } catch {
    return false;
  }
}
