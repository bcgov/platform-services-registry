import { z } from 'zod';
import { getSubGroupMembersByLicencePlateAndName } from '@/app/api/public-cloud/aws-roles/helpers';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';

const queryParamSchema = z.object({
  licencePlate: z.string(),
  role: z.string(),
  page: z.string().transform(Number),
  pageSize: z.string().transform(Number),
  searchTerm: z.string(),
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
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
