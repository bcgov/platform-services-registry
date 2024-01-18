import { getSubGroupMembersByLicencePlateAndName } from '@/app/api/public-cloud/aws-roles/helpers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import createApiHandler from '@/core/apiHandler';

interface QueryParam {
  licencePlate: string;
  role: string;
  page: number;
  pageSize: number;
  searchTerm: string;
}

const queryParamSchema = z.object({
  licencePlate: z.string(),
  role: z.string(),
  page: z.string(),
  pageSize: z.string(),
  searchTerm: z.string(),
});

const apiHandler = createApiHandler<unknown, QueryParam>({
  roles: ['user'],
  validations: { queryParams: queryParamSchema },
});

export const GET = apiHandler(async ({ queryParams }) => {
  const { licencePlate, role, page, pageSize, searchTerm } = queryParams;
  let result;
  if (licencePlate && role) {
    result = await getSubGroupMembersByLicencePlateAndName(licencePlate, role, page, pageSize, searchTerm);
  }

  return NextResponse.json(result);
});
