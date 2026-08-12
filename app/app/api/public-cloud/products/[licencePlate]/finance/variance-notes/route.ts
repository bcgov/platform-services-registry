import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { createVarianceNote } from '@/services/db/public-cloud-finance';
import { varianceNoteBodySchema } from '@/validation-schemas/cloud-cost';

const pathSchema = z.object({ licencePlate: z.string().min(1) });

export const POST = createApiHandler({
  validations: { pathParams: pathSchema, body: varianceNoteBodySchema },
})(async ({ pathParams, body, session }) => {
  if (!session.previews.publicCloudFinance && !session.previews.publicCloudForecast) {
    return UnauthorizedResponse();
  }

  const authorIdir = session.userIdirGuid || session.user?.email || 'unknown';
  const note = await createVarianceNote({
    licencePlate: pathParams.licencePlate,
    year: body.year,
    month: body.month,
    body: body.body,
    authorIdir,
    supersedesNoteId: body.supersedesNoteId,
  });

  return OkResponse(note);
});
