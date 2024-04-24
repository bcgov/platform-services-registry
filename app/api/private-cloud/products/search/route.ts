import { z } from 'zod';
import _isString from 'lodash-es/isString';
import { $Enums, Prisma } from '@prisma/client';
import createApiHandler from '@/core/api-handler';
import searchOp from '../_operations/search';
import { OkResponse } from '@/core/responses';
import { processEnumString } from '@/utils/zod';

export const bodySchema = z.object({
  search: z.string().optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
  ministry: z.preprocess(processEnumString, z.nativeEnum($Enums.Ministry).optional()),
  cluster: z.preprocess(processEnumString, z.nativeEnum($Enums.Cluster).optional()),
  includeInactive: z.boolean().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.nativeEnum(Prisma.SortOrder).optional(),
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
  });
  return OkResponse(data);
});
