import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { RequestType } from '@/prisma/client';
import { enrichMembersWithEmail, getUsersEmailsByIds } from '@/services/db/user';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const apiHandler = createApiHandler({
  validations: { pathParams: pathParamSchema },
});

export const GET = apiHandler(async ({ pathParams }) => {
  const { licencePlate } = pathParams;

  const requests = await prisma.publicCloudRequest.findMany({
    where: {
      licencePlate,
      OR: [
        {
          type: RequestType.CREATE,
        },
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
      decisionData: {
        select: {
          id: true,
          projectOwner: { select: { id: true, email: true } },
          primaryTechnicalLead: { select: { id: true, email: true } },
          secondaryTechnicalLead: { select: { id: true, email: true } },
          expenseAuthority: { select: { id: true, email: true } },
          members: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  await Promise.all(
    requests.map(async (request) => {
      const { id, members } = request.decisionData;
      const enriched = await enrichMembersWithEmail({ id, members });

      if (enriched) {
        request.decisionData.members = enriched.members;
      }
    }),
  );

  return OkResponse(requests);
});
