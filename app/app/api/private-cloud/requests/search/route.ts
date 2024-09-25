import _isString from 'lodash-es/isString';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { searchPrivateCloudRequests } from '@/queries/private-cloud-requests';
import { privateCloudRequestSearchBodySchema } from '@/validation-schemas/private-cloud';

export const POST = createApiHandler({
  roles: ['user'],
  validations: { body: privateCloudRequestSearchBodySchema },
})(async ({ session, body }) => {
  const { docs, totalCount } = await searchPrivateCloudRequests({
    session,
    ...body,
  });

  return OkResponse({ docs, totalCount });
});
