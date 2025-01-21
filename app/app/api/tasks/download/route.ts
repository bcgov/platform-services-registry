import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NoContent, CsvResponse } from '@/core/responses';
import { formatFullName } from '@/helpers/user';
import { searchTasks } from '@/services/db';
import { formatDate } from '@/utils/js';
import { taskSearchBodySchema } from '@/validation-schemas/task';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewTasks],
  validations: { body: taskSearchBodySchema },
})(async ({ session, body }) => {
  const searchProps = {
    ...body,
    page: 1,
    pageSize: 10000,
  };

  const { data } = await searchTasks(searchProps);

  if (data.length === 0) {
    return NoContent();
  }

  const formattedData = data.map((task) => ({
    Type: task.type,
    Data: task.data,
    Status: task.status,
    'Task Created': formatDate(task.createdAt),
    ClosedMetaData: task.closedMetadata,
    'Completed By Name': formatFullName(task.user),
    'Completed By Email': task.user?.email,
    'Completed At': formatDate(task.completedAt),
    'Assigned Roles': task.roles?.join(', '),
    'Assigned Permissions': task.permissions?.join(', '),
  }));
  return CsvResponse(formattedData, 'tasks.csv');
});
