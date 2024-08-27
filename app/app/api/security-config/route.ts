import { $Enums } from '@prisma/client';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { securityConfigSchema } from '@/validation-schemas/security-config';

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { body: securityConfigSchema },
});
export const PUT = apiHandler(async ({ body, session }) => {
  const existQuery = { where: { licencePlate: body.licencePlate }, session: session as never };
  let exists =
    body.context === $Enums.ProjectContext.PRIVATE
      ? await prisma.privateCloudProject.count(existQuery)
      : await prisma.publicCloudProject.count(existQuery);

  // Find the authority in the requested projects if not found in the existing projects.
  if (exists === 0) {
    exists =
      body.context === $Enums.ProjectContext.PRIVATE
        ? await prisma.privateCloudRequestedProject.count(existQuery)
        : await prisma.publicCloudRequestedProject.count(existQuery);
  }

  if (exists === 0) {
    throw Error('invalid project');
  }

  const result = await prisma.securityConfig.upsert({
    where: {
      licencePlate: body.licencePlate,
      context: body.context,
    },
    update: body,
    create: body,
    session: session as never,
  });

  return OkResponse(result);
});
