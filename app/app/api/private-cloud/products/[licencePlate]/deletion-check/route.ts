import { string, z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import openshiftDeletionCheck from '@/helpers/openshift';
import { models } from '@/services/db';
import { DeletionStatus } from '@/types/private-cloud';

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

  const deleteCheckList = await openshiftDeletionCheck('fe6594', 'KLAB');

  let result: DeletionStatus = DeletionStatus.NOT_DELETABLE;

  if (!deleteCheckList.artifactoryDeletability) {
    result = DeletionStatus.ARTIFACTORY_NOT_DELETABLE;
  } else if (Object.values(deleteCheckList).every((field) => field)) {
    result = DeletionStatus.OK_TO_DELETE;
  }

  return OkResponse(result);
});
