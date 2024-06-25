import { RequestType } from '@prisma/client';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { comparePrivateProductData } from '@/helpers/product-change';

const apiHandler = createApiHandler({
  roles: ['admin'],
  useServiceAccount: true,
});
export const POST = apiHandler(async ({}) => {
  const requests = await prisma.privateCloudRequest.findMany({
    where: { type: RequestType.EDIT },
    include: {
      originalData: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
        },
      },
      decisionData: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
        },
      },
    },
  });

  await Promise.all(
    requests.map((req) => {
      const { changes, ...otherChangeMeta } = comparePrivateProductData(req.originalData, req.decisionData);
      return prisma.privateCloudRequest.update({ where: { id: req.id }, data: { changes: otherChangeMeta } });
    }),
  );

  return OkResponse(true);
});
