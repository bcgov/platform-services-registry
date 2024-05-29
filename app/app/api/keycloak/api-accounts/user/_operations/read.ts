import { Session } from 'next-auth';
import { OkResponse, BadRequestResponse } from '@/core/responses';
import { getKcAdminClient, findClient } from '@/services/keycloak/app-realm';

export default async function getOp({ session }: { session: Session }) {
  if (!session.user.id) {
    return BadRequestResponse('invalid session user');
  }

  const kcAdminClient = await getKcAdminClient();
  const clientId = `z_pltsvc-sa-${session.user.id}`;

  const client = await findClient(clientId, kcAdminClient);

  return OkResponse(client);
}
