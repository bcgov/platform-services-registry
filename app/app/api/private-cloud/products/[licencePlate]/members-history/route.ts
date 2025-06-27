import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { RequestType } from '@/prisma/client';
import { enrichSingleUserFields } from '@/services/db/user';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const apiHandler = createApiHandler({
  validations: { pathParams: pathParamSchema },
});

export const GET = apiHandler(async ({ pathParams }) => {
  const { licencePlate } = pathParams;

  const requests = await prisma.privateCloudRequest.findMany({
    where: {
      licencePlate,
      type: RequestType.EDIT,
    },
    select: {
      id: true,
      changes: true,
      decisionDataId: true,
      originalDataId: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const filteredRequests = requests.filter(
    (req) => req.changes?.contactsChanged === true || req.changes?.membersChanged === true,
  );

  const enrichedRequests = await Promise.all(
    filteredRequests.map(async (req) => {
      const select = {
        members: req.changes?.parentPaths.includes('members'),
        projectOwnerId: req.changes?.parentPaths.includes('projectOwner'),
        primaryTechnicalLeadId: req.changes?.parentPaths.includes('primaryTechnicalLead'),
        secondaryTechnicalLeadId: req.changes?.parentPaths.includes('secondaryTechnicalLead'),
      };

      const [reqOrigin, reqDesign] = await Promise.all([
        prisma.privateCloudRequestData.findFirst({
          where: {
            id: req.originalDataId ?? '',
          },
          select,
        }),
        prisma.privateCloudRequestData.findFirst({
          where: {
            id: req.decisionDataId ?? '',
          },
          select,
        }),
      ]);

      return {
        ...req,
        originalData: reqOrigin,
        decisionData: reqDesign,
      };
    }),
  );

  const enrichedWithUserData = await Promise.all(
    enrichedRequests.map(async (req) => {
      return {
        ...req,
        originalData: await enrichSingleUserFields(req.originalData),
        decisionData: await enrichSingleUserFields(req.decisionData),
      };
    }),
  );

  return OkResponse(enrichedWithUserData);
});
