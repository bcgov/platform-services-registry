import { OkResponse } from '@/core/responses';
import { z } from 'zod';
import prisma from '@/core/prisma';
import { $Enums } from '@prisma/client';
import createApiHandler from '@/core/api-handler';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const queryParamSchema = z.object({
  context: z.union([z.literal($Enums.ProjectContext.PRIVATE), z.literal($Enums.ProjectContext.PUBLIC)]),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { pathParams: pathParamSchema, queryParams: queryParamSchema },
});
export const GET = apiHandler(async ({ pathParams, queryParams, session }) => {
  const configProm = prisma.securityConfig.findUnique({
    where: {
      licencePlate: pathParams.licencePlate,
      context: queryParams.context,
    },
    session: session as never,
  });

  const query = { where: { licencePlate: pathParams.licencePlate }, session: session as never };
  const privateQuery = { ...query, select: { cluster: true } };
  const publicQuery = { ...query, select: { provider: true } };

  const projectProm =
    queryParams.context === $Enums.ProjectContext.PRIVATE
      ? prisma.privateCloudProject.findFirst(privateQuery)
      : prisma.publicCloudProject.findFirst(publicQuery);

  const requestedProjectProm =
    queryParams.context === $Enums.ProjectContext.PRIVATE
      ? prisma.privateCloudProject.findFirst(privateQuery)
      : prisma.publicCloudProject.findFirst(publicQuery);

  const [config, project, requestedProject] = await Promise.all([configProm, projectProm, requestedProjectProm]);

  return OkResponse({ config, project: project || requestedProject });
});
