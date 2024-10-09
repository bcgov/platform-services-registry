import { ProjectContext } from '@prisma/client';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { privateCloudProductModel, publicCloudProductModel, securityConfigModel } from '@/services/db';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const queryParamSchema = z.object({
  context: z.union([z.literal(ProjectContext.PRIVATE), z.literal(ProjectContext.PUBLIC)]),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { pathParams: pathParamSchema, queryParams: queryParamSchema },
});
export const GET = apiHandler(async ({ pathParams, queryParams, session }) => {
  const configProm = securityConfigModel.get(
    {
      where: {
        licencePlate: pathParams.licencePlate,
        context: queryParams.context,
      },
    },
    session,
  );

  const query = { where: { licencePlate: pathParams.licencePlate } };
  const privateQuery = { ...query, select: { cluster: true } };
  const publicQuery = { ...query, select: { provider: true } };

  const projectProm =
    queryParams.context === ProjectContext.PRIVATE
      ? privateCloudProductModel.get(privateQuery, session)
      : publicCloudProductModel.get(publicQuery, session);

  const decisionDataProm =
    queryParams.context === ProjectContext.PRIVATE
      ? privateCloudProductModel.get(privateQuery, session)
      : publicCloudProductModel.get(publicQuery, session);

  const [config, project, decisionData] = await Promise.all([configProm, projectProm, decisionDataProm]);

  return OkResponse({ config, project: project || decisionData });
});
