import _isString from 'lodash-es/isString';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { searchPublicCloudProducts } from '@/services/db';
import { publicCloudProductSearchBodySchema } from '@/validation-schemas/public-cloud';

export const POST = createApiHandler({
  roles: [GlobalRole.User],
  validations: { body: publicCloudProductSearchBodySchema },
})(async ({ session, body }) => {
  const { docs, totalCount } = await searchPublicCloudProducts({
    session,
    ...body,
  });

  return OkResponse({ docs, totalCount });
});
