import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NotFoundResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { getAiUsageEmbedInfo, isAiUsageReportConfigured } from '@/services/ai-usage-reports';
import { models } from '@/services/db';
import { isFabricConfigured } from '@/services/fabric';
import { aiUsageReportKeys } from '@/types/fabric';

const pathParamSchema = z.object({
  licencePlate: z.string(),
  reportKey: z.enum(aiUsageReportKeys),
});

export const GET = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
})(async ({ pathParams, session }) => {
  const { licencePlate, reportKey } = pathParams;

  const { data: product } = await models.privateCloudProduct.get({ where: { licencePlate } }, session);
  if (!product?._permissions.view) {
    return UnauthorizedResponse();
  }

  if (!isFabricConfigured() || !isAiUsageReportConfigured(reportKey)) {
    return NotFoundResponse('This AI usage report is not configured');
  }

  const response = OkResponse(await getAiUsageEmbedInfo(reportKey, product));
  response.headers.set('Cache-Control', 'no-store');
  return response;
});
