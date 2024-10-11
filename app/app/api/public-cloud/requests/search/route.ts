import _isString from 'lodash-es/isString';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { searchPublicCloudRequests } from '@/services/db';
import { publicCloudRequestSearchBodySchema } from '@/validation-schemas/public-cloud';

export const POST = createApiHandler({
  roles: [GlobalRole.User],
  validations: { body: publicCloudRequestSearchBodySchema },
})(async ({ session, body }) => {
  const { docs, totalCount } = await searchPublicCloudRequests({
    session,
    ...body,
  });

  return OkResponse({ docs, totalCount });
});
