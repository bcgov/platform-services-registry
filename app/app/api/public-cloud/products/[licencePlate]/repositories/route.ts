import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { ForbiddenResponse, NotFoundResponse, OkResponse } from '@/core/responses';
import { models } from '@/services/db';
import { hasRepositoriesSchema, repositoriesSchema, validateRepositorySelection } from '@/validation-schemas/shared';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const bodySchema = z
  .object({
    hasRepositories: hasRepositoriesSchema,
    repositories: repositoriesSchema,
  })
  .superRefine(validateRepositorySelection);

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  validations: {
    pathParams: pathParamSchema,
    body: bodySchema,
  },
});

export const PATCH = apiHandler(async ({ pathParams, body, session }) => {
  const { licencePlate } = pathParams;
  const { data: product } = await models.publicCloudProduct.get(
    {
      where: {
        licencePlate,
      },
    },
    session,
  );

  if (!product) {
    return NotFoundResponse('Public Cloud product not found');
  }

  if (!product._permissions.edit) {
    return ForbiddenResponse('You do not have permission to edit this product');
  }

  const { data: updatedProduct } = await models.publicCloudProduct.update(
    {
      where: {
        licencePlate,
      },
      data: {
        hasRepositories: body.hasRepositories,
        repositories: body.repositories,
      },
    },
    session,
  );

  return OkResponse(updatedProduct);
});
