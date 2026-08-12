import { z } from 'zod';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { resolveUnmatchedBillingLine } from '@/services/db/public-cloud-finance';
import { financeResolveUnmatchedBodySchema } from '@/validation-schemas/cloud-cost';

const pathSchema = z.object({ id: z.string().min(1) });

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewPublicCloudForecast],
  validations: { pathParams: pathSchema, body: financeResolveUnmatchedBodySchema },
})(async ({ pathParams, body, session }) => {
  if (!session.previews.publicCloudFinance) {
    return UnauthorizedResponse();
  }
  try {
    const updated = await resolveUnmatchedBillingLine(pathParams.id, body.licencePlate);
    return OkResponse(updated);
  } catch {
    return BadRequestResponse('Unable to resolve unmatched line');
  }
});
