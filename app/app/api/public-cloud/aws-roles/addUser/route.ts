import { z } from 'zod';
import { addUserToGroupByEmail } from '@/app/api/public-cloud/aws-roles/helpers';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';

const queryParamSchema = z.object({
  userPrincipalName: z.string(),
  userEmail: z.string(),
  groupId: z.string(),
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  validations: { queryParams: queryParamSchema },
});

export const PUT = apiHandler(async ({ queryParams, session }) => {
  const { userPrincipalName, userEmail, groupId } = queryParams;

  let result;
  if (userPrincipalName && userEmail && groupId) {
    result = await addUserToGroupByEmail(userPrincipalName, userEmail, groupId);
  }

  return OkResponse({
    data: result,
  });
});
