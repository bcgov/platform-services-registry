import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { models } from '@/services/db';
import { createProductForecast, getProductForecast, seedForecastValues } from '@/services/db/public-cloud-forecast';
import { cloudCostForecastBodySchema } from '@/validation-schemas/cloud-cost';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

export const GET = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
})(async ({ pathParams, session }) => {
  if (!session.previews.publicCloudForecast) {
    return UnauthorizedResponse();
  }

  const { licencePlate } = pathParams;
  const { data: product } = await models.publicCloudProduct.get({ where: { licencePlate } }, session);
  if (!product) {
    return UnauthorizedResponse();
  }
  if (!product._permissions.viewForecast) {
    return UnauthorizedResponse();
  }

  const forecast = await getProductForecast(licencePlate);
  return OkResponse({ forecast });
});

export const POST = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema, body: cloudCostForecastBodySchema.partial().optional() },
})(async ({ pathParams, body, session }) => {
  if (!session.previews.publicCloudForecast) {
    return UnauthorizedResponse();
  }

  const { licencePlate } = pathParams;
  const { data: product } = await models.publicCloudProduct.get({ where: { licencePlate } }, session);
  if (!product) {
    return UnauthorizedResponse();
  }
  if (!product._permissions.editForecast) {
    return UnauthorizedResponse();
  }

  let monthlyValues: { year: number; month: number; amount: number; currency: string }[] | undefined =
    body?.monthlyValues;
  const horizonMonths = body?.horizonMonths ?? 24;

  if (!monthlyValues?.length) {
    monthlyValues = await seedForecastValues(product);
  }

  try {
    const forecast = await createProductForecast(licencePlate, monthlyValues, horizonMonths);
    return OkResponse(forecast);
  } catch (e) {
    return BadRequestResponse((e as Error).message);
  }
});
