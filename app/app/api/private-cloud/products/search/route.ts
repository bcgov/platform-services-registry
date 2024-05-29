import { $Enums, Prisma } from '@prisma/client';
import _isString from 'lodash-es/isString';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { processEnumString, processUpperEnumString } from '@/utils/zod';
import searchOp from '../_operations/search';

const bodySchema = z.object({
  search: z.string().optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
  ministry: z.preprocess(processUpperEnumString, z.nativeEnum($Enums.Ministry).optional()),
  cluster: z.preprocess(processUpperEnumString, z.nativeEnum($Enums.Cluster).optional()),
  includeInactive: z.boolean().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.preprocess(processEnumString, z.nativeEnum(Prisma.SortOrder).optional()),
  showTest: z.boolean().default(false),
});

export const POST = createApiHandler({
  roles: ['user'],
  validations: { body: bodySchema },
})(async ({ session, body }) => {
  const {
    search = '',
    page = 1,
    pageSize = 5,
    ministry = '',
    cluster = '',
    includeInactive = false,
    sortKey,
    sortOrder,
    showTest,
  } = body;

  const data = await searchOp({
    session,
    search,
    page,
    pageSize,
    ministry,
    cluster,
    active: !includeInactive,
    sortKey: sortKey || undefined,
    sortOrder,
    isTest: showTest,
  });

  return OkResponse(data);
});
