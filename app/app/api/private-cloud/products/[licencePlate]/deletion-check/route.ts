import { string, z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import openshiftDeletionCheck from '@/helpers/openshift';
import { models } from '@/services/db';

const pathParamSchema = z.object({
  licencePlate: string(),
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});

export const GET = apiHandler(async ({ pathParams, session }) => {
  const { licencePlate } = pathParams;
  const { data: product } = await models.privateCloudProduct.get({ where: { licencePlate } }, session);

  if (!product?._permissions.view) {
    return UnauthorizedResponse();
  }

  const deleteCheckList = await openshiftDeletionCheck(licencePlate, product.cluster);

  let result = 'NOT_DELETABLE';

  if (!deleteCheckList.artifactoryDeletability) {
    result = 'ARTIFACTORY_NOT_DELETABLE';
  } else if (Object.values(deleteCheckList).every((field) => field)) {
    result = 'OK_TO_DELETE';
  }
  result = 'ARTIFACTORY_NOT_DELETABLE';
  return OkResponse(result);
});
