import _isString from 'lodash/isString';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { publicCloudRequestSearchBodySchema } from '@/schema';
import searchOp from '../_operations/search';

export const POST = createApiHandler({
  roles: ['user'],
  validations: { body: publicCloudRequestSearchBodySchema },
})(async ({ session, body }) => {
  const {
    licencePlate = '',
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
    licencePlate,
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
