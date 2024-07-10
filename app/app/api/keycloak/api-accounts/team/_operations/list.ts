import { Session } from 'next-auth';
import { TEAM_SA_PREFIX } from '@/constants';
import { OkResponse, BadRequestResponse } from '@/core/responses';
import { getKcAdminClient, findClients } from '@/services/keycloak/app-realm';

export default async function listOp({ session }: { session: Session }) {
  const kcAdminClient = await getKcAdminClient();

  let clients = await findClients(TEAM_SA_PREFIX, kcAdminClient);

  if (!session.isAdmin) {
    const teamClientIds = session.teams.map((team) => team.clientId);
    clients = clients.filter((client) => client.clientId && teamClientIds.includes(client.clientId));
  }

  return OkResponse(clients);
}
