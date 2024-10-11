import { z } from 'zod';
import { removeUserFromGroup } from '@/app/api/public-cloud/aws-roles/helpers';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';

const queryParamSchema = z.object({
  userId: z.string(),
  groupId: z.string(),
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  validations: { queryParams: queryParamSchema },
});

export const DELETE = apiHandler(async ({ queryParams, session }) => {
  const { userId, groupId } = queryParams;

  let result;
  if (userId && groupId) {
    result = await removeUserFromGroup(userId, groupId);
  }

  return OkResponse({
    data: result,
  });
});
