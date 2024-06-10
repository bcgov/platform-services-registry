import { $Enums } from '@prisma/client';
import { Session } from 'next-auth';
import { AUTH_RELM } from '@/config';
import { OkResponse, BadRequestResponse } from '@/core/responses';
import { createEvent } from '@/mutations/events';
import { getKcAdminClient, findClient } from '@/services/keycloak/app-realm';

export default async function getOp({ session }: { session: Session }) {
  if (!session.user.id) {
    return BadRequestResponse('invalid session user');
  }

  const kcAdminClient = await getKcAdminClient();
  const clientId = `z_pltsvc-sa-${session.user.id}`;

  let client = await findClient(clientId, kcAdminClient);
  if (client) {
    return OkResponse(client);
  }

  await kcAdminClient.clients.create({ realm: AUTH_RELM, clientId });

  client = await findClient(clientId, kcAdminClient);
  if (client?.id) {
    await Promise.all([
      kcAdminClient.clients.update(
        { realm: AUTH_RELM, id: client.id },
        {
          description: `Created by the Registry app as the service account for user (${session.user.email}).`,
          enabled: true,
          publicClient: false,
          serviceAccountsEnabled: true,
          standardFlowEnabled: false,
          implicitFlowEnabled: false,
          directAccessGrantsEnabled: false,
        },
      ),
      kcAdminClient.clients.addProtocolMapper(
        { realm: AUTH_RELM, id: client.id },
        {
          name: 'email',
          protocol: 'openid-connect',
          protocolMapper: 'oidc-hardcoded-claim-mapper',
          config: {
            'claim.name': 'email',
            'claim.value': session.user.email,
            'jsonType.label': 'String',
            'id.token.claim': 'true',
            'access.token.claim': 'true',
            'userinfo.token.claim': 'true',
            'access.tokenResponse.claim': 'false',
          },
        },
      ),
      kcAdminClient.clients.addProtocolMapper(
        { realm: AUTH_RELM, id: client.id },
        {
          name: 'kc-userid',
          protocol: 'openid-connect',
          protocolMapper: 'oidc-hardcoded-claim-mapper',
          config: {
            'claim.name': 'kc-userid',
            'claim.value': session.kcUserId,
            'jsonType.label': 'String',
            'id.token.claim': 'true',
            'access.token.claim': 'true',
            'userinfo.token.claim': 'true',
            'access.tokenResponse.claim': 'false',
          },
        },
      ),
    ]);
  }

  client = await findClient(clientId, kcAdminClient);
  await createEvent($Enums.EventType.CREATE_API_TOKEN, session.user.id);

  return OkResponse(client);
}
