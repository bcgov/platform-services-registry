import { Prisma } from '@prisma/client';
import _isNumber from 'lodash-es/isNumber';
import { UserInfo } from '@/constants/task';
import prisma from '@/core/prisma';
import { parsePaginationParams } from '@/helpers/pagination';
import { TaskSearchBody } from '@/validation-schemas/task';

export type SearchTasks = Prisma.TaskGetPayload<{
  select: {
    id: true;
    closedMetadata: true;
    completedAt: true;
    completedBy: true;
    createdAt: true;
    data: true;
    permissions: true;
    roles: true;
    status: true;
    type: true;
    userIds: true;
    user: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        email: true;
        ministry: true;
        jobTitle: true;
        image: true;
      };
    };
  };
}>;

const defaultSortKey = 'createdAt';
export async function searchTasks({
  tasks = [],
  search = '',
  page,
  skip,
  take,
  pageSize,
  sortOrder = Prisma.SortOrder.desc,
  sortKey = defaultSortKey,
}: TaskSearchBody & {
  skip?: number;
  take?: number;
}): Promise<{ data: SearchTasks[]; totalCount: number; usersWithAssignedTasks: UserInfo[] }> {
  const isTaskSearch = tasks.length > 0;
  if (!_isNumber(skip) && !_isNumber(take) && page && pageSize) {
    ({ skip, take } = parsePaginationParams(page, pageSize, 10));
  }

  const filters: Prisma.TaskWhereInput = {};

  if (search.trim()) {
    const searchCriteria: Prisma.StringFilter<'User'> = { contains: search, mode: 'insensitive' };

    filters.OR = [
      { user: { firstName: searchCriteria } },
      { user: { lastName: searchCriteria } },
      { user: { email: searchCriteria } },
      { user: { ministry: searchCriteria } },
    ];
  }

  if (isTaskSearch) {
    filters.type = { in: tasks };
  }

  const orderBy = { [sortKey]: sortOrder };

  const [data, totalCount] = await Promise.all([
    prisma.task.findMany({
      skip,
      take,
      where: filters,
      orderBy,
      select: {
        id: true,
        closedMetadata: true,
        completedAt: true,
        completedBy: true,
        createdAt: true,
        data: true,
        permissions: true,
        roles: true,
        status: true,
        type: true,
        userIds: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            ministry: true,
            jobTitle: true,
            image: true,
          },
        },
      },
    }),
    prisma.task.count({ where: filters }),
  ]);

  const userIds = Array.from(new Set(data.flatMap((task) => (task.userIds ? Object.values(task.userIds) : []))));
  const usersWithAssignedTasks = await prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
  });

  return { data, totalCount, usersWithAssignedTasks };
}
