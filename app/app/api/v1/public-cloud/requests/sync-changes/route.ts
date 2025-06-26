import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { comparePublicProductData } from '@/helpers/product-change';
import { PublicCloudRequest, RequestType } from '@/prisma/client';
import { enrichMembersWithEmail } from '@/services/db';

const apiHandler = createApiHandler({
  roles: [GlobalRole.Admin],
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
          expenseAuthority: true,
        },
      },
      decisionData: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
          expenseAuthority: true,
        },
      },
    },
  });

  const results: PublicCloudRequest[] = [];

  for (const req of requests) {
    const [enrichedOriginal, enrichedDecision] = await Promise.all([
      enrichMembersWithEmail(req.originalData),
      enrichMembersWithEmail(req.decisionData),
    ]);
    const { changes, ...otherChangeMeta } = comparePublicProductData(enrichedOriginal, enrichedDecision);

    const updated = await prisma.publicCloudRequest.update({
      where: { id: req.id },
      data: { changes: otherChangeMeta },
    });

    results.push(updated);
  }

  if (!results.length) {
    return OkResponse({ message: 'No updates were made.' });
  }
  return OkResponse(results.map((res) => res.id));
});
