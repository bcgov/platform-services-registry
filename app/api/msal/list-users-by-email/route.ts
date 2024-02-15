import { NextResponse } from 'next/server';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { listUsersByEmail } from '@/msal/service';

interface QueryParam {
  email: string;
}

const queryParamSchema = z.object({
  email: z.string(),
});

const apiHandler = createApiHandler<undefined, QueryParam>({
  roles: ['user'],
  validations: { queryParams: queryParamSchema },
});
export const GET = apiHandler(async ({ queryParams }) => {
  const { email } = queryParams;

  const users = await listUsersByEmail(email);
  return NextResponse.json(users);
});
