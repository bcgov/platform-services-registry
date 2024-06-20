import _isString from 'lodash-es/isString';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { privateCloudRequestSearchBodySchema } from '@/schema';
import searchOp from '../_operations/search';

export const POST = createApiHandler({
  roles: ['user'],
  validations: { body: privateCloudRequestSearchBodySchema },
})(async ({ session, body }) => {
  const {
    licencePlate = '',
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
    licencePlate,
    session,
    search,
    page,
    pageSize,
    ministry,
    cluster,
    includeInactive,
    sortKey: sortKey || undefined,
    sortOrder,
    isTest: showTest,
  });

  return OkResponse(data);
});
