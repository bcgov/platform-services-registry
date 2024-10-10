import { EventType } from '@prisma/client';
import { Session } from 'next-auth';
import { AUTH_RELM } from '@/config';
import { OkResponse, BadRequestResponse } from '@/core/responses';
import { createEvent } from '@/services/db';
import { getKcAdminClient } from '@/services/keycloak/app-realm';

export default async function getOp({ id, session }: { id: string; session: Session }) {
  if (!session.user.id) {
    return BadRequestResponse('invalid session user');
  }

  const kcAdminClient = await getKcAdminClient();
  await kcAdminClient.clients.del({
    realm: AUTH_RELM,
    id,
  });

  await createEvent(EventType.DELETE_TEAM_API_TOKEN, session.user.id, { clientUid: id });

  return OkResponse(true);
}
