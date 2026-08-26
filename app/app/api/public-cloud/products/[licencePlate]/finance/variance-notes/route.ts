import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { models } from '@/services/db';
import { createVarianceNote } from '@/services/db/public-cloud-finance';
import { varianceNoteBodySchema } from '@/validation-schemas/cloud-cost';

const pathSchema = z.object({ licencePlate: z.string().min(1) });

export const POST = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathSchema, body: varianceNoteBodySchema },
})(async ({ pathParams, body, session }) => {
  if (!session.previews.publicCloudFinance) {
    return UnauthorizedResponse();
  }

  const { data: product } = await models.publicCloudProduct.get(
    { where: { licencePlate: pathParams.licencePlate } },
    session,
  );
  if (!product?._permissions.editForecast) {
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
