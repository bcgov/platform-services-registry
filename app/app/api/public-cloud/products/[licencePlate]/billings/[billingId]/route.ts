import _isEqual from 'lodash-es/isEqual';
import { z } from 'zod';
import { GlobalPermissions, GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { models } from '@/services/db';
import { objectId } from '@/validation-schemas';

const pathParamSchema = z.object({
  licencePlate: z.string(),
  billingId: objectId,
});

export const GET = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
})(async ({ pathParams, session }) => {
  const { licencePlate, billingId } = pathParams;

  const { data: billing } = await models.publicCloudBilling.get({ where: { licencePlate, id: billingId } }, session);
  if (!billing?._permissions.view) {
    return UnauthorizedResponse();
  }

  return OkResponse(billing);
});
