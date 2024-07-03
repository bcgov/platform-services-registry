import { ProjectStatus } from '@prisma/client';
import _isString from 'lodash-es/isString';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { privateCloudProductSearchBodySchema } from '@/schema';
import searchOp from '../_operations/search';

export const POST = createApiHandler({
  roles: ['user'],
  validations: { body: privateCloudProductSearchBodySchema },
})(async ({ session, body }) => {
  const {
    search = '',
    page = 1,
    pageSize = 5,
    ministry,
    cluster,
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
    status: includeInactive ? undefined : ProjectStatus.ACTIVE,
    sortKey: sortKey || undefined,
    sortOrder,
    isTest: showTest,
  });

  return OkResponse(data);
});
