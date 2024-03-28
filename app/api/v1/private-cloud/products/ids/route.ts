import { $Enums } from '@prisma/client';
import prisma from '@/core/prisma';
import { z } from 'zod';
import _isString from 'lodash-es/isString';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';

const queryParamSchema = z.object({
  cluster: z.preprocess((v) => (_isString(v) ? v.toUpperCase() : ''), z.nativeEnum($Enums.Cluster)),
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
      cluster,
    },
    select: {
      id: true,
      cluster: true,
    },
  });

  const productIds = products.map((product) => product.id);
  return OkResponse(productIds);
});
