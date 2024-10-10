import _isString from 'lodash-es/isString';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { searchPrivateCloudProducts } from '@/services/db';
import { privateCloudProductSearchBodySchema } from '@/validation-schemas/private-cloud';

export const POST = createApiHandler({
  roles: ['user'],
  validations: { body: privateCloudProductSearchBodySchema },
})(async ({ session, body }) => {
  const { docs, totalCount } = await searchPrivateCloudProducts({
    session,
    ...body,
  });

  return OkResponse({ docs, totalCount });
});
