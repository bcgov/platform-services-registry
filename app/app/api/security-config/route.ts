import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { ProjectContext } from '@/prisma/client';
import { models } from '@/services/db';
import { securityConfigSchema } from '@/validation-schemas/security-config';

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  validations: { body: securityConfigSchema },
});
export const PUT = apiHandler(async ({ body, session }) => {
  const { licencePlate, context, repositories = [] } = body;

  const existQuery = { where: { licencePlate: licencePlate } };
  let { data: count } =
    body.context === ProjectContext.PRIVATE
      ? await models.privateCloudProduct.count(existQuery)
      : await models.publicCloudProduct.count(existQuery);

  // Find the authority in the requested projects if not found in the existing projects.
  if (count === 0) {
    count =
      body.context === ProjectContext.PRIVATE
        ? await prisma.privateCloudRequestData.count(existQuery)
        : await prisma.publicCloudRequestData.count(existQuery);
  }

  if (count === 0) {
    throw Error('invalid project');
  }

  if (context === ProjectContext.PRIVATE) {
    const product = await prisma.privateCloudProduct.update({
      where: {
        licencePlate,
      },
      data: {
        repositories,
      },
      select: {
        licencePlate: true,
        repositories: true,
      },
    });

    return OkResponse(product);
  }

  const product = await prisma.publicCloudProduct.update({
    where: {
      licencePlate,
    },
    data: {
      repositories,
    },
    select: {
      licencePlate: true,
      repositories: true,
    },
  });

  return OkResponse(product);
});
