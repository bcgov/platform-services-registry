import { getSubGroupMembersByLicencePlateAndName } from '@/app/api/public-cloud/aws-roles/helpers';
import { OkResponse } from '@/core/responses';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';

const queryParamSchema = z.object({
  licencePlate: z.string(),
  role: z.string(),
  page: z.string().transform(Number),
  pageSize: z.string().transform(Number),
  searchTerm: z.string(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { queryParams: queryParamSchema },
});

export const GET = apiHandler(async ({ queryParams }) => {
  const { licencePlate, role, page, pageSize, searchTerm } = queryParams;
  let result;
  if (licencePlate && role) {
    result = await getSubGroupMembersByLicencePlateAndName(licencePlate, role, page, pageSize, searchTerm);
  }

  return OkResponse(result);
});
