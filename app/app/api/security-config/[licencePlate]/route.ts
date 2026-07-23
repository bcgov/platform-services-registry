import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { ProjectContext } from '@/prisma/client';
import { models } from '@/services/db';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const queryParamSchema = z.object({
  context: z.union([z.literal(ProjectContext.PRIVATE), z.literal(ProjectContext.PUBLIC)]),
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema, queryParams: queryParamSchema },
});
export const GET = apiHandler(async ({ pathParams, queryParams, session }) => {
  const { licencePlate } = pathParams;
  const { context } = queryParams;

  const configProm = models.securityConfig.get(
    {
      where: {
        licencePlate: licencePlate,
        context: context,
      },
    },
    session,
  );

  const projectProm =
    queryParams.context === ProjectContext.PRIVATE
      ? models.privateCloudProduct.get(
          {
            where: {
              licencePlate,
            },
            select: {
              cluster: true,
              repositories: true,
            },
          },
          session,
        )
      : models.publicCloudProduct.get(
          {
            where: {
              licencePlate,
            },
            select: {
              provider: true,
              repositories: true,
            },
          },
          session,
        );

  const [config, project] = await Promise.all([configProm, projectProm]);

  return OkResponse({
    config,
    project,
  });
});
