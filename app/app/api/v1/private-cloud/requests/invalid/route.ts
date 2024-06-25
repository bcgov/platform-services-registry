import { RequestType } from '@prisma/client';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';

const apiHandler = createApiHandler({
  roles: ['admin'],
  useServiceAccount: true,
});
export const GET = apiHandler(async ({}) => {
  const rproducts = await prisma.privateCloudRequestedProject.findMany({ select: { id: true } });
  const rproductIds = rproducts.map((v) => v.id);

  const requests = await prisma.privateCloudRequest.findMany({
    where: {
      OR: [
        { type: RequestType.CREATE, requestDataId: { notIn: rproductIds } },
        { type: RequestType.CREATE, decisionDataId: { notIn: rproductIds } },
        { type: RequestType.EDIT, originalDataId: { notIn: rproductIds } },
        { type: RequestType.EDIT, requestDataId: { notIn: rproductIds } },
        { type: RequestType.EDIT, decisionDataId: { notIn: rproductIds } },
        { type: RequestType.DELETE, originalDataId: { notIn: rproductIds } },
        { type: RequestType.DELETE, requestDataId: { notIn: rproductIds } },
        { type: RequestType.DELETE, decisionDataId: { notIn: rproductIds } },
      ],
    },
  });

  return OkResponse(requests);
});
