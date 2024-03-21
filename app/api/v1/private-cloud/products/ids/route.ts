import { $Enums } from '@prisma/client';
import prisma from '@/core/prisma';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';

const queryParamSchema = z.object({
  cluster: z.string(),
});

const apiHandler = createApiHandler({
  keycloakOauth2: {
    clientId: 'registry-gitops-ci',
  },
  validations: { queryParams: queryParamSchema },
});
export const GET = apiHandler(async ({ queryParams, session }) => {
  const { cluster } = queryParams;

  const products = await prisma.privateCloudProject.findMany({
    where: {
      status: 'ACTIVE',
      cluster: cluster.toUpperCase() as $Enums.Cluster,
    },
    select: {
      id: true,
      cluster: true,
    },
  });

  const productIds = products.map((product) => product.id);
  return OkResponse(productIds);
});
