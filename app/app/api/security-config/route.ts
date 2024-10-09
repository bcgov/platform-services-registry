import { ProjectContext } from '@prisma/client';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { privateCloudProductModel, publicCloudProductModel, securityConfigModel } from '@/services/db';
import { securityConfigSchema } from '@/validation-schemas/security-config';

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { body: securityConfigSchema },
});
export const PUT = apiHandler(async ({ body, session }) => {
  const existQuery = { where: { licencePlate: body.licencePlate } };
  let { data: count } =
    body.context === ProjectContext.PRIVATE
      ? await privateCloudProductModel.count(existQuery)
      : await publicCloudProductModel.count(existQuery);

  // Find the authority in the requested projects if not found in the existing projects.
  if (count === 0) {
    count =
      body.context === ProjectContext.PRIVATE
        ? await prisma.privateCloudRequestedProject.count(existQuery)
        : await prisma.publicCloudRequestedProject.count(existQuery);
  }

  if (count === 0) {
    throw Error('invalid project');
  }

  const result = await securityConfigModel.upsert(
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
