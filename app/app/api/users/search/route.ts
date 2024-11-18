import UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';
import _compact from 'lodash-es/compact';
import _forEach from 'lodash-es/forEach';
import _isString from 'lodash-es/isString';
import { GlobalPermissions, GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { searchUsers } from '@/services/db';
import { listUsersByRoles, findUserByEmail, getKcAdminClient } from '@/services/keycloak/app-realm';
import { userSearchBodySchema } from '@/validation-schemas';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewUsers],
  validations: { body: userSearchBodySchema },
})(async ({ body }) => {
  const isRoleSearch = body.roles.length > 0;
  const kcAdminClient = await getKcAdminClient();

  let usersByRole: { [key: string]: UserRepresentation[] };
  let roleEmails: string[] = [];

  if (isRoleSearch) {
    const ret = await listUsersByRoles(body.roles, kcAdminClient);
    usersByRole = ret.usersByRole;
    roleEmails = _compact(ret.users.map((user) => user.email?.toLocaleLowerCase()));
    if (roleEmails.length === 0) return OkResponse({ data: [], totalCount: 0 });
  }

  const result = await searchUsers({ ...body, extraFilter: roleEmails.length ? { email: { in: roleEmails } } : {} });

  const findUserRoles = await (async () => {
    if (isRoleSearch) {
      return (email: string) => {
        email = email.toLowerCase();
        const authRoleNames: string[] = [];
        _forEach(usersByRole, (users, roleName) => {
          if (users.find((usr) => usr.email && usr.email.toLowerCase() === email)) {
            authRoleNames.push(roleName);
          }
        });

        return authRoleNames;
      };
    }
    const kcProfiles = await Promise.all(result.data.map((v) => findUserByEmail(v.email, kcAdminClient)));
    return (email: string) => {
      email = email.toLowerCase();
      return kcProfiles.find((prof) => prof?.email && prof.email.toLowerCase() === email)?.authRoleNames ?? [];
    };
  })();

  result.data = await Promise.all(
    result.data.map(async (user, index) => {
      const [privateProducts, publicProducts] = await Promise.all([
        prisma.privateCloudProject.findMany({
          where: {
            OR: [
              { projectOwnerId: user.id },
              { primaryTechnicalLeadId: user.id },
              { secondaryTechnicalLeadId: user.id },
              { members: { some: { userId: user.id } } },
            ],
          },
          select: { licencePlate: true, name: true },
        }),
        prisma.publicCloudProject.findMany({
          where: {
            OR: [
              { projectOwnerId: user.id },
              { primaryTechnicalLeadId: user.id },
              { secondaryTechnicalLeadId: user.id },
              { expenseAuthorityId: user.id },
              { members: { some: { userId: user.id } } },
            ],
          },
          select: { licencePlate: true, name: true },
        }),
      ]);

      return {
        ...user,
        privateProducts,
        publicProducts,
        roles: findUserRoles(user.email),
      };
    }),
  );

  return OkResponse(result);
});
