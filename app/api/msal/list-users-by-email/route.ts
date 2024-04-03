import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { listUsersByEmail } from '@/services/msgraph';
import { OkResponse } from '@/core/responses';

const queryParamSchema = z.object({
  email: z.string(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  validations: { queryParams: queryParamSchema },
});
export const GET = apiHandler(async ({ queryParams }) => {
  const { email } = queryParams;

  const users = await listUsersByEmail(email);
  return OkResponse(users);
});
