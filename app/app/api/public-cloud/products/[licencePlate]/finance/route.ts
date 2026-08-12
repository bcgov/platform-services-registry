import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { models } from '@/services/db';
import { getProductActuals, listVarianceNotes } from '@/services/db/public-cloud-finance';
import { getProductForecast } from '@/services/db/public-cloud-forecast';

const pathSchema = z.object({ licencePlate: z.string().min(1) });

export const GET = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathSchema },
})(async ({ pathParams, session }) => {
  if (!session.previews.publicCloudFinance && !session.previews.publicCloudForecast) {
    return UnauthorizedResponse();
  }

  const { data: product } = await models.publicCloudProduct.get(
    { where: { licencePlate: pathParams.licencePlate } },
    session,
  );
  if (!product?._permissions.viewForecast) {
    return UnauthorizedResponse();
  }

  const [forecast, actuals, notes] = await Promise.all([
    getProductForecast(pathParams.licencePlate),
    getProductActuals(pathParams.licencePlate),
    listVarianceNotes(pathParams.licencePlate),
  ]);

  return OkResponse({
    licencePlate: pathParams.licencePlate,
    forecast: forecast
      ? {
          id: forecast.id,
          horizonMonths: forecast.horizonMonths,
          monthlyValues: forecast.monthlyValues,
          updatedAt: forecast.updatedAt,
        }
      : null,
    actuals,
    varianceNotes: notes.map((note) => ({
      id: note.id,
      year: note.year,
      month: note.month,
      body: note.body,
      authorIdir: note.authorIdir,
      createdAt: note.createdAt.toISOString(),
      supersedesNoteId: note.supersedesNoteId,
    })),
  });
});
