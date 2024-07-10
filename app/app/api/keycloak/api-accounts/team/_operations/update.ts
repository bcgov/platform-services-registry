import { $Enums } from '@prisma/client';
import { Session } from 'next-auth';
import { AUTH_RELM } from '@/config';
import { OkResponse, BadRequestResponse } from '@/core/responses';
import { createEvent } from '@/mutations/events';
import { getKcAdminClient, findClient } from '@/services/keycloak/app-realm';

export default async function getOp({ id, roles, session }: { id: string; roles: string[]; session: Session }) {
  if (!session.user.id) {
    return BadRequestResponse('invalid session user');
  }

  const kcAdminClient = await getKcAdminClient();
  let client = await kcAdminClient.clients.findOne({
    realm: AUTH_RELM,
    id,
  });

  if (client?.id) {
    const mappers = await kcAdminClient.clients.listProtocolMappers({ realm: AUTH_RELM, id: client.id });
    const rolesMapper = mappers.find((mapper) => mapper.name === 'roles');

    const rolesMapperData = {
      name: 'roles',
      protocol: 'openid-connect',
      protocolMapper: 'oidc-hardcoded-claim-mapper',
      config: {
        'claim.name': 'roles',
        'claim.value': roles.join(','),
        'jsonType.label': 'String',
        'id.token.claim': 'true',
        'access.token.claim': 'true',
        'userinfo.token.claim': 'true',
        'access.tokenResponse.claim': 'false',
      },
    };

    if (rolesMapper?.id) {
      await kcAdminClient.clients.updateProtocolMapper(
        {
          realm: AUTH_RELM,
          id: client.id,
          mapperId: rolesMapper?.id,
        },
        { id: rolesMapper?.id, ...rolesMapperData },
      );
    } else {
      await kcAdminClient.clients.addProtocolMapper({ realm: AUTH_RELM, id: client.id }, rolesMapperData);
    }

    try {
      await kcAdminClient.clients.createRole({
        realm: AUTH_RELM,
        id: client.id,
        name: 'member',
      });
    } catch {}
  }

  client = await kcAdminClient.clients.findOne({
    realm: AUTH_RELM,
    id,
  });

  if (client) {
    await createEvent($Enums.EventType.UPDATE_TEAM_API_TOKEN, session.user.id, { clientUid: client.id, roles });
  }

  return OkResponse(client);
}
