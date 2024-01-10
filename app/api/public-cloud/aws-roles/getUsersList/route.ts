import { getSubGroupMembersByLicencePlateAndName } from '@/app/api/public-cloud/aws-roles/helpers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import createApiHandler from '@/core/apiHandler';

interface QueryParam {
  licencePlate: string;
  role: string;
  page: number;
  pageSize: number;
}

const queryParamSchema = z.object({
  licencePlate: z.string(),
  role: z.string(),
  page: z.string(),
  pageSize: z.string(),
});

const apiHandler = createApiHandler<unknown, QueryParam>({
  roles: ['user'],
  validations: { queryParams: queryParamSchema },
});

export const GET = apiHandler(async ({ queryParams, session }) => {
  const { licencePlate, role, page, pageSize } = queryParams;
  let result;
  if (licencePlate && role) {
    result = await getSubGroupMembersByLicencePlateAndName(licencePlate, role, page, pageSize);
  }

  return NextResponse.json(
    {
      success: true,
      data: result,
    },
    {
      status: 201,
    },
  );
});
