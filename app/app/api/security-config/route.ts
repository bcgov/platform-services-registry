import { ProjectContext } from '@prisma/client';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { models } from '@/services/db';
import { securityConfigSchema } from '@/validation-schemas/security-config';

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  validations: { body: securityConfigSchema },
});
export const PUT = apiHandler(async ({ body, session }) => {
  const existQuery = { where: { licencePlate: body.licencePlate } };
  let { data: count } =
    body.context === ProjectContext.PRIVATE
      ? await models.privateCloudProduct.count(existQuery)
      : await models.publicCloudProduct.count(existQuery);

  // Find the authority in the requested projects if not found in the existing projects.
  if (count === 0) {
    count =
      body.context === ProjectContext.PRIVATE
        ? await prisma.publicCloudRequestData.count(existQuery)
        : await prisma.publicCloudRequestData.count(existQuery);
  }

  if (count === 0) {
    throw Error('invalid project');
  }

  const result = await models.securityConfig.upsert(
    {
      where: {
        licencePlate: body.licencePlate,
        context: body.context,
      },
      update: body,
      create: body,
    },
    session,
  );

  return OkResponse(result);
});
