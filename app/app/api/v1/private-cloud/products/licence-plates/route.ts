import { Prisma, Cluster } from '@prisma/client';
import _isString from 'lodash-es/isString';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { processBooleanPositive } from '@/utils/js';

const queryParamSchema = z.object({
  cluster: z.preprocess((v) => (_isString(v) ? v.toUpperCase() : ''), z.nativeEnum(Cluster)),
  active: z.preprocess(processBooleanPositive, z.boolean()),
});

const apiHandler = createApiHandler({
  keycloakOauth2: {
    clientId: 'registry-gitops-ci',
  },
  validations: { queryParams: queryParamSchema },
});
export const GET = apiHandler(async ({ queryParams }) => {
  const { cluster, active } = queryParams;

  const where: Prisma.PrivateCloudProductWhereInput = active ? { status: 'ACTIVE' } : {};
  where.cluster = cluster;

  const licencePlateRecords = await prisma.privateCloudProject.findMany({
    where,
    select: { licencePlate: true },
    distinct: ['licencePlate'],
  });

  const licencePlates = licencePlateRecords.map((rec) => rec.licencePlate);
  return OkResponse(licencePlates);
});
