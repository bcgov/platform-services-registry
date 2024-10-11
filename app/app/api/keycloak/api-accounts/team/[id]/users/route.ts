import { RoleMappingPayload } from '@keycloak/keycloak-admin-client/lib/defs/roleRepresentation';
import { EventType } from '@prisma/client';
import { z } from 'zod';
import { AUTH_RELM } from '@/config';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse, BadRequestResponse } from '@/core/responses';
import { createEvent } from '@/services/db';
import { getKcAdminClient, findClient } from '@/services/keycloak/app-realm';

const pathParamSchema = z.object({
  id: z.string(),
});

const bodySchema = z.object({
  users: z
    .object({
      email: z.string(),
      type: z.enum(['add', 'remove']),
    })
    .array(),
});

export const GET = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
})(async ({ session, pathParams }) => {
  const { id: clientUid } = pathParams;

  const kcAdminClient = await getKcAdminClient();
  const exisitingUsers = await kcAdminClient.clients.findUsersWithRole({
    realm: AUTH_RELM,
    id: clientUid,
    roleName: 'member',
  });

  return OkResponse(exisitingUsers);
});

export const POST = createApiHandler({
  roles: [GlobalRole.Admin],
  validations: { pathParams: pathParamSchema, body: bodySchema },
})(async ({ session, pathParams, body }) => {
  const { id: clientUid } = pathParams;
  const { users } = body;

  const result: {
    success: boolean;
    email: string;
    error?: string;
  }[] = [];

  const kcAdminClient = await getKcAdminClient();
  await Promise.all(
    users.map(async (user) => {
      const kusers = await kcAdminClient.users.find({ exact: true, email: user.email });
      if (kusers.length > 0 && kusers[0].id) {
        try {
          const memberRole = await kcAdminClient.clients.findRole({
            realm: AUTH_RELM,
            id: clientUid,
            roleName: 'member',
          });

          const roleMapping = {
            realm: AUTH_RELM,
            id: kusers[0].id,
            clientUniqueId: clientUid,
            roles: [memberRole as RoleMappingPayload],
          };

          if (user.type === 'add') {
            await kcAdminClient.users.addClientRoleMappings(roleMapping);
          } else {
            await kcAdminClient.users.delClientRoleMappings(roleMapping);
          }

          result.push({ success: true, email: user.email });
        } catch (error) {
          console.error(error);
          result.push({ success: false, email: user.email, error: String(error) });
        }
      } else {
        result.push({ success: false, email: user.email, error: 'NOT_FOUND' });
      }
    }),
  );

  await createEvent(EventType.UPDATE_TEAM_API_TOKEN, session.user.id, { clientUid, users, result });

  return OkResponse(result);
});
