import { z } from 'zod';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { reviewSpendFlag } from '@/services/db/public-cloud-finance';
import { financeReviewFlagBodySchema } from '@/validation-schemas/cloud-cost';

const pathSchema = z.object({ id: z.string().min(1) });

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewPublicCloudForecast],
  validations: { pathParams: pathSchema, body: financeReviewFlagBodySchema },
})(async ({ pathParams, body, session }) => {
  if (!session.previews.publicCloudFinance) {
    return UnauthorizedResponse();
  }
  const idir = session.userIdirGuid || session.userEmail || session.user?.email || 'unknown';
  try {
    const updated = await reviewSpendFlag(pathParams.id, idir, body.reviewNote);
    return OkResponse(updated);
  } catch {
    return BadRequestResponse('Unable to review flag');
  }
});
