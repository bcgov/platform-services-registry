import { EventType } from '@prisma/client';
import { Session } from 'next-auth';
import { AUTH_RELM } from '@/config';
import { TEAM_SA_PREFIX } from '@/constants';
import { OkResponse, BadRequestResponse } from '@/core/responses';
import { createEvent } from '@/services/db';
import { getKcAdminClient, findClient } from '@/services/keycloak/app-realm';
import { generateShortId } from '@/utils/js';
import { getRolesMapperPayload, getServiceAccountTypeMapperPayload } from '../../mappers';
import { syncClientUserRoles } from '../_helpers';

export default async function getOp({
  name,
  roles,
  users,
  session,
}: {
  name: string;
  roles: string[];
  users: { email: string }[];
  session: Session;
}) {
  if (!session.user.id) {
    return BadRequestResponse('invalid session user');
  }

  const kcAdminClient = await getKcAdminClient();
  const tsaId = generateShortId();
  const clientId = `${TEAM_SA_PREFIX}${tsaId}`;

  await kcAdminClient.clients.create({ realm: AUTH_RELM, name, clientId });

  let user = {};

  let client = await findClient(clientId, kcAdminClient);
  if (client?.id) {
    const clientUid = client.id;

    await Promise.all([
      kcAdminClient.clients.update(
        { realm: AUTH_RELM, id: clientUid },
        {
          description: `Created by the Registry app as a team service account.`,
          enabled: true,
          publicClient: false,
          serviceAccountsEnabled: true,
          standardFlowEnabled: false,
          implicitFlowEnabled: false,
          directAccessGrantsEnabled: false,
        },
      ),
      kcAdminClient.clients.addProtocolMapper({ realm: AUTH_RELM, id: clientUid }, getRolesMapperPayload(roles)),
      kcAdminClient.clients.addProtocolMapper(
        { realm: AUTH_RELM, id: clientUid },
        getServiceAccountTypeMapperPayload('team'),
      ),
      kcAdminClient.clients.createRole({
        realm: AUTH_RELM,
        id: clientUid,
        name: 'member',
      }),
    ]);

    user = await syncClientUserRoles(kcAdminClient, clientUid, users);
  }

  client = await findClient(clientId, kcAdminClient);

  if (client) {
    await createEvent(EventType.CREATE_TEAM_API_TOKEN, session.user.id, {
      clientUid: client.id,
    });
  }

  return OkResponse({ client, user });
}
