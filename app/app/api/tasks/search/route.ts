import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse } from '@/core/responses';
import { searchTasks } from '@/services/db/task';
import { taskSearchBodySchema } from '@/validation-schemas/task';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewTasks],
  validations: { body: taskSearchBodySchema },
})(async ({ body }) => {
  const result = await searchTasks(body);
  return OkResponse(result);
});
