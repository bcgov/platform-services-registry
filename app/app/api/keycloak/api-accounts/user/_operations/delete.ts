import { EventType } from '@prisma/client';
import { Session } from 'next-auth';
import { AUTH_RELM } from '@/config';
import { OkResponse, BadRequestResponse } from '@/core/responses';
import { createEvent } from '@/services/db';
import { getKcAdminClient, findClient } from '@/services/keycloak/app-realm';

export default async function getOp({ session }: { session: Session }) {
  if (!session.user.id) {
    return BadRequestResponse('invalid session user');
  }

  const kcAdminClient = await getKcAdminClient();
  const clientId = `z_pltsvc-sa-${session.user.id}`;

  const client = await findClient(clientId, kcAdminClient);
  if (client?.id) {
    await kcAdminClient.clients.del({
      realm: AUTH_RELM,
      id: client.id,
    });

    await createEvent(EventType.DELETE_API_TOKEN, session.user.id);

    return OkResponse(true);
  }

  return OkResponse(false);
}
