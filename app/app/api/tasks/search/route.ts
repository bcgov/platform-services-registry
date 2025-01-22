import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { models } from '@/services/db';
import { searchTasks } from '@/services/db/task';
import { taskSearchBodySchema } from '@/validation-schemas/task';

interface UserInfo {
  id: string;
  image: string;
  ministry: string;
  email: string;
  firstName: string;
  lastName: string;
}

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewTasks],
  validations: { body: taskSearchBodySchema },
})(async ({ body }) => {
  const result = await searchTasks(body);
  return OkResponse(result);
});

export const GET = createApiHandler({})(async () => {
  const tasks = await prisma.task.findMany();
  const userIds = Array.from(new Set(tasks.flatMap((task) => (task.userIds ? Object.values(task.userIds) : []))));
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    select: {
      id: true,
      image: true,
      ministry: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  });

  const userInfoMap = users.reduce(
    (acc, user) => {
      acc[user.id] = {
        id: user.id,
        image: user.image ?? '',
        ministry: user.ministry ?? '',
        email: user.email ?? '',
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
      };
      return acc;
    },
    {} as { [key: string]: UserInfo },
  );

  return OkResponse(userInfoMap);
});
