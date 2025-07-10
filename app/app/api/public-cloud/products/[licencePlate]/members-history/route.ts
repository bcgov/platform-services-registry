import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { RequestType } from '@/prisma/client';
import { buildMembersHistory } from '@/services/db/members-history';
import { getPathParamSchema } from '../schema';

export const GET = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: getPathParamSchema },
})(async ({ pathParams }) => {
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
      type: true,
      createdAt: true,
      changes: true,
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
    orderBy: { createdAt: 'asc' },
  });

  const history = await buildMembersHistory(requests);

  return OkResponse({
    requests: history.requests,
    users: history.users,
  });
});
