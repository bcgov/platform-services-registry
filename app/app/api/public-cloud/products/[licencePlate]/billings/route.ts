import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { models } from '@/services/db';
import { upsertPublicCloudBillings } from '@/services/db/public-cloud-billing';
import { publicCloudBillingBodySchema } from '@/validation-schemas';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

export const GET = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
})(async ({ pathParams, session }) => {
  const { licencePlate } = pathParams;

  const { data: billings } = await models.publicCloudBilling.list({ where: { licencePlate } }, session);
  return OkResponse(billings);
});

export const PUT = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema, body: publicCloudBillingBodySchema },
})(async ({ pathParams, body, session }) => {
  const { licencePlate } = pathParams;
  const { accountCoding } = body;

  const { data: product } = await models.publicCloudProduct.get({ where: { licencePlate } }, session);
  if (!product?._permissions.editAccountCoding) {
    return UnauthorizedResponse();
  }

  if (!product.expenseAuthorityId) {
    return BadRequestResponse('invalid expense authority');
  }

  await upsertPublicCloudBillings({
    product,
    accountCoding,
    expenseAuthorityId: product.expenseAuthorityId,
    session,
  });

  return OkResponse(true);
});
