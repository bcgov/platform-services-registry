import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { ForbiddenResponse, NotFoundResponse, OkResponse } from '@/core/responses';
import { ProjectContext } from '@/prisma/client';
import { models } from '@/services/db';
import { securityConfigSchema } from '@/validation-schemas/security-config';

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  validations: {
    body: securityConfigSchema,
  },
});

export const PUT = apiHandler(async ({ body, session }) => {
  const { licencePlate, context, repositories = [] } = body;

  const hasRepositories =
    body.hasRepositories === undefined ? (repositories.length > 0 ? true : null) : body.hasRepositories;

  if (context === ProjectContext.PRIVATE) {
    const { data: privateProduct } = await models.privateCloudProduct.get(
      {
        where: {
          licencePlate,
        },
      },
      session,
    );

    if (!privateProduct) {
      return NotFoundResponse('Private Cloud product not found');
    }

    if (!privateProduct._permissions.edit) {
      return ForbiddenResponse('You do not have permission to edit this product');
    }

    const { data: updatedPrivateProduct } = await models.privateCloudProduct.update(
      {
        where: {
          licencePlate,
        },
        data: {
          repositories,
          hasRepositories,
        },
      },
      session,
    );

    return OkResponse(updatedPrivateProduct);
  }

  const { data: publicProduct } = await models.publicCloudProduct.get(
    {
      where: {
        licencePlate,
      },
    },
    session,
  );

  if (!publicProduct) {
    return NotFoundResponse('Public Cloud product not found');
  }

  if (!publicProduct._permissions.edit) {
    return ForbiddenResponse('You do not have permission to edit this product');
  }

  const { data: updatedPublicProduct } = await models.publicCloudProduct.update(
    {
      where: {
        licencePlate,
      },
      data: {
        repositories,
        hasRepositories,
      },
    },
    session,
  );

  return OkResponse(updatedPublicProduct);
});
