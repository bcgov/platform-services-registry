import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';

export const GET = createApiHandler({
  roles: [GlobalRole.User],
  validations: {},
})(async () => {
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const unitPrice = await prisma.privateCloudUnitPrice.findFirst({
    where: { date: { lte: today } },
    orderBy: {
      date: 'desc',
    },
  });

  return OkResponse(unitPrice);
});
