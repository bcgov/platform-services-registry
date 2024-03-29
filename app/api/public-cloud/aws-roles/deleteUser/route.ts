import { removeUserFromGroup } from '@/app/api/public-cloud/aws-roles/helpers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';

const queryParamSchema = z.object({
  userId: z.string(),
  groupId: z.string(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { queryParams: queryParamSchema },
});

export const DELETE = apiHandler(async ({ queryParams, session }) => {
  const { userId, groupId } = queryParams;

  let result;
  if (userId && groupId) {
    result = await removeUserFromGroup(userId, groupId);
  }

  return NextResponse.json({
    data: result,
  });
});
