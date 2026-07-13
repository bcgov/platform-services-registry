import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { models } from '@/services/db';
import {
  createForecastDraft,
  getActiveApprovedForecast,
  seedForecastDraftValues,
} from '@/services/db/public-cloud-accountability';
import { cloudCostForecastBodySchema } from '@/validation-schemas/cloud-cost';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

export const GET = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
})(async ({ pathParams, session }) => {
  const { licencePlate } = pathParams;
  const { data: product } = await models.publicCloudProduct.get({ where: { licencePlate } }, session);
  if (!product?._permissions.viewAccountability) {
    return UnauthorizedResponse();
  }

  const forecasts = await prisma.cloudCostForecast.findMany({
    where: { licencePlate },
    orderBy: { version: 'desc' },
  });
  const activeForecast = await getActiveApprovedForecast(licencePlate);
  return OkResponse({ forecasts, activeForecast });
});

export const POST = createApiHandler({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema, body: cloudCostForecastBodySchema.partial().optional() },
})(async ({ pathParams, body, session }) => {
  const { licencePlate } = pathParams;
  const { data: product } = await models.publicCloudProduct.get({ where: { licencePlate } }, session);
  if (!product?._permissions.editForecast) {
    return UnauthorizedResponse();
  }

  let monthlyValues: { year: number; month: number; amount: number; currency: string }[] | undefined =
    body?.monthlyValues;
  const horizonMonths = body?.horizonMonths ?? 24;

  if (!monthlyValues?.length) {
    monthlyValues = await seedForecastDraftValues(product);
  }

  try {
    const forecast = await createForecastDraft(licencePlate, monthlyValues, horizonMonths);
    return OkResponse(forecast);
  } catch (e) {
    return BadRequestResponse((e as Error).message);
  }
});
