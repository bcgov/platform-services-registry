import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { comparePrivateProductData } from '@/helpers/product-change';
import { PrivateCloudRequest, RequestType } from '@/prisma/client';
import { enrichMembersWithEmail } from '@/services/db';

const apiHandler = createApiHandler({
  roles: [GlobalRole.Admin],
  useServiceAccount: true,
});
export const POST = apiHandler(async () => {
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

  const results: PrivateCloudRequest[] = [];

  for (const req of requests) {
    const [enrichedOriginal, enrichedDecision] = await Promise.all([
      enrichMembersWithEmail(req.originalData),
      enrichMembersWithEmail(req.decisionData),
    ]);
    const { changes, ...otherChangeMeta } = comparePrivateProductData(enrichedOriginal, enrichedDecision);

    const updated = await prisma.privateCloudRequest.update({
      where: { id: req.id },
      data: { changes: otherChangeMeta },
    });

    results.push(updated);
  }

  await prisma.privateCloudRequest.updateMany({
    where: { type: { not: RequestType.EDIT } },
    data: { changes: null },
  });

  return OkResponse(results.map((ret) => ret.id));
});
