import { AuthorizationV1Api } from '@kubernetes/client-node';
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
