import { Cluster, Prisma } from '@prisma/client';
import _isString from 'lodash-es/isString';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';

const queryParamSchema = z.object({
  cluster: z.preprocess((v) => (_isString(v) ? v.toUpperCase() : ''), z.nativeEnum(Cluster)),
});

const apiHandler = createApiHandler({
  keycloakOauth2: {
    clientId: 'registry-gitops-ci',
  },
  validations: { queryParams: queryParamSchema },
});
export const GET = apiHandler(async ({ queryParams, session }) => {
  const { cluster } = queryParams;

  const where: Prisma.PrivateCloudProjectWhereInput = {
    status: 'ACTIVE',
    cluster,
  };

  if (cluster === Cluster.GOLDDR) {
    where.cluster = Cluster.GOLD;
    where.golddrEnabled = true;
  }

  const products = await prisma.privateCloudProject.findMany({
    where,
    select: {
      id: true,
    },
  });

  const productIds = products.map((product) => product.id);
  return OkResponse(productIds);
});
