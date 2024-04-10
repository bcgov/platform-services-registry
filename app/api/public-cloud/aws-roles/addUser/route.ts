import { addUserToGroupByEmail } from '@/app/api/public-cloud/aws-roles/helpers';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';

const queryParamSchema = z.object({
  userPrincipalName: z.string(),
  userEmail: z.string(),
  groupId: z.string(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
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
