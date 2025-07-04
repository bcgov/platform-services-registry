import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { RequestType } from '@/prisma/client';
import { buildRequestDiff, collectChangedUserIds, UserWithRoleChanges } from '@/services/db/members-history';
import { getPathParamSchema } from '../schema';

export const GET = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: getPathParamSchema },
})(async ({ pathParams, session }) => {
  const { licencePlate } = pathParams;

  const requests = await prisma.publicCloudRequest.findMany({
    where: {
      licencePlate,
      OR: [
        { type: RequestType.CREATE },
        {
          type: RequestType.EDIT,
          changes: {
            is: {
              OR: [{ contactsChanged: true }, { membersChanged: true }],
            },
          },
        },
      ],
    },
    select: {
      id: true,
      changes: true,
      type: true,
      createdAt: true,
      originalData: {
        select: {
          projectOwnerId: true,
          primaryTechnicalLeadId: true,
          secondaryTechnicalLeadId: true,
          expenseAuthorityId: true,
          members: true,
        },
      },
      decisionData: {
        select: {
          projectOwnerId: true,
          primaryTechnicalLeadId: true,
          secondaryTechnicalLeadId: true,
          expenseAuthorityId: true,
          members: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const userIds = collectChangedUserIds(requests);

  const users = await prisma.user.findMany({
    where: { id: { in: Array.from(userIds) } },
  });

  const userMap = new Map<string, UserWithRoleChanges>(
    users.map((user) => [user.id, { ...user, prevRoles: [], newRoles: [] }]),
  );

  const result = requests.map((request) => buildRequestDiff(request, userMap));

  return OkResponse(result);
});
