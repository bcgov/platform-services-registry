import { AuthorizationV1Api, V1SelfSubjectAccessReview } from '@kubernetes/client-node';
import { Cluster } from '@/prisma/client';
import { configureKubeConfig } from '@/services/k8s/helpers';

export async function validateK8sToken(cluster: Cluster, token: string): Promise<boolean> {
  try {
    const kc = configureKubeConfig(cluster, token);
    const authApi = kc.makeApiClient(AuthorizationV1Api);

    const sar: V1SelfSubjectAccessReview = {
      apiVersion: 'authorization.k8s.io/v1',
      kind: 'SelfSubjectAccessReview',
      spec: {
        resourceAttributes: {
          verb: 'get',
          resource: 'pods',
        },
      },
    };

    const response = await authApi.createSelfSubjectAccessReview({ body: sar });
    return response.status?.allowed === true;
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
export async function validateClientCredentials({ tokenUrl, clientId, clientSecret, scope }: TokenData) {
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  if (scope) params.append('scope', scope);

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}
