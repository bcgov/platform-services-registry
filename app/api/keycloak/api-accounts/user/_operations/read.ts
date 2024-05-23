import { Session } from 'next-auth';
import { OkResponse } from '@/core/responses';
import { getKcAdminClient, findClient } from '@/services/keycloak/app-realm';

export default async function getOp({ session }: { session: Session }) {
  const kcAdminClient = await getKcAdminClient();
  const clientId = `pltsvc-service-account-${session.user.id}`;

  const client = await findClient(clientId, kcAdminClient);

  return OkResponse(client);
}
