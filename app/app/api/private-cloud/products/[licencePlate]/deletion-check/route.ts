import { string, z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import openshiftDeletionCheck from '@/helpers/openshift';
import { getPrivateCloudProduct } from '@/queries/private-cloud-products';

export const fetchCache = 'force-no-store';

const pathParamSchema = z.object({
  licencePlate: string(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { pathParams: pathParamSchema },
});

export const GET = apiHandler(async ({ pathParams, session }) => {
  const { licencePlate } = pathParams;
  const product = await getPrivateCloudProduct(session, licencePlate);

  if (!product?._permissions.view) {
    return UnauthorizedResponse();
  }

  const deleteCheckList = await openshiftDeletionCheck(pathParams.licencePlate, product.cluster);

  let result = 'NOT_DELETABLE';

  if (Object.values(deleteCheckList).every((field) => field)) {
    result = 'OK_TO_DELETE';
  }

  return OkResponse(result);
});
