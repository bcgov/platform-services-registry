import { z } from 'zod';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { models } from '@/services/db';

interface UserInfo {
  id: string;
  image: string;
  ministry: string;
  email: string;
  firstName: string;
  lastName: string;
}

const apiHandler = createApiHandler({
  permissions: [GlobalPermissions.ViewUsers],
});

export const GET = apiHandler(async ({ session }) => {
  const tasks = await prisma.task.findMany();
  const userIds = Array.from(new Set(tasks.flatMap((task) => (task.userIds ? Object.values(task.userIds) : []))));

  const userQueries = await Promise.all(
    userIds.map(async (userId) => {
      const userResult = await models.user.get(
        {
          where: {
            id: userId,
          },
          select: {
            id: true,
            image: true,
            ministry: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        session,
      );

      return {
        id: userResult.data?.id,
        image: userResult.data?.image,
        ministry: userResult.data?.ministry,
        email: userResult.data?.email,
        firstName: userResult.data?.firstName,
        lastName: userResult.data?.lastName,
      };
    }),
  );

  const userData = userQueries.filter((userInfo) => userInfo !== null) as UserInfo[];

  const userInfoMap = userData.reduce(
    (acc, userInfo) => {
      acc[userInfo.id] = userInfo;
      return acc;
    },
    {} as { [key: string]: UserInfo },
  );

  return OkResponse(userInfoMap);
});
