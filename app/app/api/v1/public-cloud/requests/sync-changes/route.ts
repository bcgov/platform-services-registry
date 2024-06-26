import { RequestType } from '@prisma/client';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { comparePublicProductData } from '@/helpers/product-change';

const apiHandler = createApiHandler({
  roles: ['admin'],
  useServiceAccount: true,
});
export const POST = apiHandler(async () => {
  const requests = await prisma.publicCloudRequest.findMany({
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

  const results = await Promise.all(
    requests.map((req) => {
      const { changes, ...otherChangeMeta } = comparePublicProductData(req.originalData, req.decisionData);
      return prisma.publicCloudRequest.update({ where: { id: req.id }, data: { changes: otherChangeMeta } });
    }),
  );

  return OkResponse(results.map((ret) => ret.id));
});
