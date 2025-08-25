import { Session } from 'next-auth';
import { AUTH_RELM } from '@/config';
import { OkResponse, BadRequestResponse } from '@/core/responses';
import { EventType } from '@/prisma/client';
import { createEvent } from '@/services/db';
import { getKcAdminClient } from '@/services/keycloak/app-realm';
import { getRolesMapperPayload } from '../../mappers';
import { syncClientUserRoles } from '../_helpers';

export default async function getOp({
  id,
  name,
  roles,
  users,
  session,
}: {
  id: string;
  name: string;
  roles: string[];
  users: { email: string }[];
  session: Session;
}) {
  if (!session.user.id) {
    return BadRequestResponse('invalid session user');
  }

  const kcAdminClient = await getKcAdminClient();
  let client = await kcAdminClient.clients.findOne({
    realm: AUTH_RELM,
    id,
  });

  let user = {};

  if (client?.id) {
    const clientUid = client.id;
    const mappers = await kcAdminClient.clients.listProtocolMappers({ realm: AUTH_RELM, id: client.id });
    const rolesMapper = mappers.find((mapper) => mapper.name === 'roles');

    const rolesMapperData = getRolesMapperPayload(roles);

    if (rolesMapper?.id) {
      await Promise.all([
        kcAdminClient.clients.update(
          {
            realm: AUTH_RELM,
            id: clientUid,
          },
          { name },
        ),
        kcAdminClient.clients.updateProtocolMapper(
          {
            realm: AUTH_RELM,
            id: clientUid,
            mapperId: rolesMapper?.id,
          },
          { id: rolesMapper?.id, ...rolesMapperData },
        ),
      ]);
    } else {
      await kcAdminClient.clients.addProtocolMapper({ realm: AUTH_RELM, id: clientUid }, rolesMapperData);
    }

    try {
      await kcAdminClient.clients.createRole({
        realm: AUTH_RELM,
        id: clientUid,
        name: 'member',
      });
    } catch {}

    user = await syncClientUserRoles(kcAdminClient, clientUid, users);
  }

  client = await kcAdminClient.clients.findOne({
    realm: AUTH_RELM,
    id,
  });

  if (client) {
    await createEvent(EventType.UPDATE_TEAM_API_TOKEN, session.user.id, { clientUid: client.id!, roles });
  }

  return OkResponse({ client, user });
}
