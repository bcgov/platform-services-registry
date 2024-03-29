import { getGroupsNamesByLicencePlate } from '@/app/api/public-cloud/aws-roles/helpers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';

const queryParamSchema = z.object({
  licencePlate: z.string(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { queryParams: queryParamSchema },
});

export const GET = apiHandler(async ({ queryParams }) => {
  const { licencePlate } = queryParams;
  const result = await getGroupsNamesByLicencePlate(licencePlate);
  return NextResponse.json(result);
});
