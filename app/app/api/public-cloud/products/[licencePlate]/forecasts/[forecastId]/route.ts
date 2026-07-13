import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { models } from '@/services/db';
import { updateProductForecast } from '@/services/db/public-cloud-forecast';
import { objectId } from '@/validation-schemas';
import { cloudCostForecastBodySchema } from '@/validation-schemas/cloud-cost';

const pathParamSchema = z.object({
  licencePlate: z.string(),
  forecastId: objectId,
});

export const PUT = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema, body: cloudCostForecastBodySchema },
})(async ({ pathParams, body, session }) => {
  const { licencePlate, forecastId } = pathParams;
  const { data: product } = await models.publicCloudProduct.get({ where: { licencePlate } }, session);
  if (!product) {
    return UnauthorizedResponse();
  }
  if (!product._permissions.editForecast) {
    return UnauthorizedResponse();
  }

  try {
    const forecast = await updateProductForecast(licencePlate, forecastId, body.monthlyValues, body.horizonMonths);
    return OkResponse(forecast);
  } catch (e) {
    return BadRequestResponse((e as Error).message);
  }
});
