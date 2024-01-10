import { addUserToGroupByEmail } from '@/app/api/public-cloud/aws-roles/helpers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import createApiHandler from '@/core/apiHandler';

interface QueryParam {
  userEmail: string;
  groupId: string;
}

const queryParamSchema = z.object({
  userEmail: z.string(),
  groupId: z.string(),
});

const apiHandler = createApiHandler<unknown, QueryParam>({
  roles: ['user'],
  validations: { queryParams: queryParamSchema },
});

export const PUT = apiHandler(async ({ queryParams, session }) => {
  const { userEmail, groupId } = queryParams;

  let result;
  if (userEmail && groupId) {
    result = await addUserToGroupByEmail(userEmail, groupId);
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
