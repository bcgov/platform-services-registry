import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { listUsersByEmail } from '@/services/msgraph';

const queryParamSchema = z.object({
  email: z.string(),
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  validations: { queryParams: queryParamSchema },
});
export const GET = apiHandler(async ({ queryParams }) => {
  const { email } = queryParams;

  const users = await listUsersByEmail(email);
  return OkResponse(users);
});
