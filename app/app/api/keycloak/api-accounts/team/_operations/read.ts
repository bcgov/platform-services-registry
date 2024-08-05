import { Session } from 'next-auth';
import { AUTH_RELM } from '@/config';
import { OkResponse, BadRequestResponse } from '@/core/responses';
import { getKcAdminClient, findClient } from '@/services/keycloak/app-realm';

export default async function getOp({ id, session }: { id: string; session: Session }) {
  const kcAdminClient = await getKcAdminClient();

  const client = await kcAdminClient.clients.findOne({
    realm: AUTH_RELM,
    id,
  });

  if (!session.isAdmin) {
    const teamClientIds = session.teams.map((team) => team.clientId);
    if (!teamClientIds.includes(client?.clientId ?? '')) return OkResponse(null);
  }

  return OkResponse(client);
}
