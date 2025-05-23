import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { searchPrivateCloudProducts } from '@/services/db';
import { privateCloudProductSearchBodySchema } from '@/validation-schemas/private-cloud';

export const POST = createApiHandler({
  roles: [GlobalRole.User],
  validations: { body: privateCloudProductSearchBodySchema },
})(async ({ session, body }) => {
  const { docs, totalCount } = await searchPrivateCloudProducts({
    session,
    ...body,
  });

  return OkResponse({ docs, totalCount });
});
