import { Session } from 'next-auth';
import { AUTH_RELM } from '@/config';
import { OkResponse } from '@/core/responses';
import { getKcAdminClient, findClient } from '@/services/keycloak/app-realm';

export default async function getOp({ session }: { session: Session }) {
  const kcAdminClient = await getKcAdminClient();
  const clientId = `pltsvc-service-account-${session.user.id}`;

  const client = await findClient(clientId, kcAdminClient);
  if (client?.id) {
    await kcAdminClient.clients.del({
      realm: AUTH_RELM,
      id: client.id,
    });

    return OkResponse(true);
  }

  return OkResponse(false);
}
