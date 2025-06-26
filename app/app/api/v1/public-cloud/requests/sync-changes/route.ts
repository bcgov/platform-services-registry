import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { comparePublicProductData } from '@/helpers/product-change';
import { RequestType } from '@/prisma/client';

const BATCH_SIZE = 10;

function chunkArray<T>(array: T[]): T[][] {
  return Array.from({ length: Math.ceil(array.length / BATCH_SIZE) }, (_, i) =>
    array.slice(i * BATCH_SIZE, i * BATCH_SIZE + BATCH_SIZE),
  );
}

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

  const results = await Promise.all(
    requests.map((req) => {
      const { changes, ...otherChangeMeta } = comparePublicProductData(req.originalData, req.decisionData);
      return prisma.publicCloudRequest.update({ where: { id: req.id }, data: { changes: otherChangeMeta } });
    }),
  );

  for (const batch of chunkArray(requests)) {
    const batchResults = await Promise.all(
      batch.map(async (req) => {
        const { changes, ...otherChangeMeta } = comparePublicProductData(req.originalData, req.decisionData);
        return prisma.publicCloudRequest.update({
          where: { id: req.id },
          data: { changes: otherChangeMeta },
        });
      }),
    );
    results.push(...batchResults);
  }

  await prisma.publicCloudRequest.updateMany({
    where: { type: { not: RequestType.EDIT } },
    data: { changes: null },
  });

  if (!results.length) {
    return OkResponse({ message: 'No updates were made.' });
  }
  return OkResponse(results.map((ret) => ret.id));
});
