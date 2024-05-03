import { NextResponse } from 'next/server';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { getUserPhoto } from '@/services/msgraph';

const queryParamSchema = z.object({
  email: z.string(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { queryParams: queryParamSchema },
});
export const GET = apiHandler(async ({ queryParams }) => {
  const { email } = queryParams;

  const data = await getUserPhoto(email);

  if (data) {
    return new NextResponse(data, {
      headers: { 'Content-Type': 'image/jpeg' },
    });
  }

  return new NextResponse(data);
});
