import { ProjectStatus } from '@prisma/client';
import _isString from 'lodash-es/isString';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { publicCloudProductSearchBodySchema } from '@/validation-schemas/public-cloud';
import searchOp from '../_operations/search';

export const POST = createApiHandler({
  roles: ['user'],
  validations: { body: publicCloudProductSearchBodySchema },
})(async ({ session, body }) => {
  const { search = '', page = 1, pageSize = 5, ministry, provider, includeInactive = false, sortKey, sortOrder } = body;

  const data = await searchOp({
    session,
    search,
    page,
    pageSize,
    ministry,
    provider,
    status: includeInactive ? undefined : ProjectStatus.ACTIVE,
    sortKey: sortKey || undefined,
    sortOrder,
  });

  return OkResponse(data);
});
