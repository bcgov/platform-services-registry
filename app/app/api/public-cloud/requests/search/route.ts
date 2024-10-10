import _isString from 'lodash-es/isString';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { searchPublicCloudRequests } from '@/services/db';
import { publicCloudRequestSearchBodySchema } from '@/validation-schemas/public-cloud';

export const POST = createApiHandler({
  roles: ['user'],
  validations: { body: publicCloudRequestSearchBodySchema },
})(async ({ session, body }) => {
  const { docs, totalCount } = await searchPublicCloudRequests({
    session,
    ...body,
  });

  return OkResponse({ docs, totalCount });
});
