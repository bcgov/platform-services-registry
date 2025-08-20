import _isString from 'lodash-es/isString';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { Cluster, Prisma } from '@/prisma/client';

const queryParamSchema = z.object({
  cluster: z.preprocess((v) => (_isString(v) ? v.toUpperCase() : ''), z.enum(Cluster)),
});

const apiHandler = createApiHandler({
  keycloakOauth2: {
    clientId: 'registry-gitops-ci',
  },
  validations: { queryParams: queryParamSchema },
});
export const GET = apiHandler(async ({ queryParams, session }) => {
  const { cluster } = queryParams;

  const where: Prisma.PrivateCloudProductWhereInput = {
    status: 'ACTIVE',
    cluster,
  };

  if (cluster === Cluster.GOLDDR) {
    where.cluster = Cluster.GOLD;
    where.golddrEnabled = true;
  }

  const products = await prisma.privateCloudProduct.findMany({
    where,
    select: {
      id: true,
    },
  });

  const productIds = products.map((product) => product.id);
  return OkResponse(productIds);
});
