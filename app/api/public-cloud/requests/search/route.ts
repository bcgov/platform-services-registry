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
  provider: z.preprocess(processUpperEnumString, z.nativeEnum($Enums.Provider).optional()),
  includeInactive: z.boolean().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.preprocess(processEnumString, z.nativeEnum(Prisma.SortOrder).optional()),
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
    provider = '',
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
    provider,
    includeInactive,
    sortKey: sortKey || undefined,
    sortOrder,
  });

  return OkResponse(data);
});
