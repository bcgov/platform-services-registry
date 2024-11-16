import { Prisma } from '@prisma/client';
import _compact from 'lodash-es/compact';
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
  const kcAdminClient = await getKcAdminClient();

  let roleEmails: string[] = [];

  if (body.roles.length > 0) {
    const roleKcUsers = await listUsersByRoles(body.roles, kcAdminClient);
    roleEmails = _compact(roleKcUsers.map((user) => user.email?.toLocaleLowerCase()));
    if (roleEmails.length === 0) return OkResponse({ data: [], totalCount: 0 });
  }

  const result = await searchUsers({ ...body, extraFilter: roleEmails.length ? { email: { in: roleEmails } } : {} });

  const kcProfiles = await Promise.all(result.data.map((v) => findUserByEmail(v.email, kcAdminClient)));

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

      return { ...user, privateProducts, publicProducts, roles: kcProfiles[index]?.authRoleNames ?? [] };
    }),
  );

  return OkResponse(result);
});
