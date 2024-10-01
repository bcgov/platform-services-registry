import _isString from 'lodash-es/isString';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { searchPublicCloudProducts } from '@/queries/public-cloud-products';
import { publicCloudProductSearchBodySchema } from '@/validation-schemas/public-cloud';

export const POST = createApiHandler({
  roles: ['user'],
  validations: { body: publicCloudProductSearchBodySchema },
})(async ({ session, body }) => {
  const { docs, totalCount } = await searchPublicCloudProducts({
    session,
    ...body,
  });

  return OkResponse({ docs, totalCount });
});
