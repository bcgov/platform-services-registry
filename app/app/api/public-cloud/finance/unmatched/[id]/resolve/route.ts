import { z } from 'zod';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { BadRequestResponse, ConflictResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { resolveUnmatchedBillingLine } from '@/services/db/public-cloud-finance';
import {
  ingestFailureMessage,
  isIngestAlreadyRunningError,
} from '@/services/public-cloud-finance/ingest/ingest-errors';
import { financeResolveUnmatchedBodySchema } from '@/validation-schemas/cloud-cost';
import { objectId } from '@/validation-schemas/common';

const pathSchema = z.object({ id: objectId });

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
  } catch (error) {
    if (isIngestAlreadyRunningError(error)) return ConflictResponse(ingestFailureMessage(error));
    return BadRequestResponse('Unable to resolve unmatched line');
  }
});
