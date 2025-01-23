import { Prisma } from '@prisma/client';
import _isNumber from 'lodash-es/isNumber';
import _uniq from 'lodash-es/uniq';
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
    completedByUser: {
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
  types = [],
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
  const isTaskSearch = types.length > 0;
  if (!_isNumber(skip) && !_isNumber(take) && page && pageSize) {
    ({ skip, take } = parsePaginationParams(page, pageSize, 10));
  }

  const filters: Prisma.TaskWhereInput = {};

  search = search.trim();
  if (search) {
    const searchCriteria: Prisma.StringFilter<'User'> = { contains: search, mode: 'insensitive' };

    filters.completedByUser = {
      OR: [
        { firstName: searchCriteria },
        { lastName: searchCriteria },
        { email: searchCriteria },
        { ministry: searchCriteria },
      ],
    };
  }

  if (isTaskSearch) {
    filters.type = { in: types };
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
        completedByUser: {
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

  const userIds = _uniq(data.flatMap((task) => task.userIds ?? []));
  const usersWithAssignedTasks = await prisma.user.findMany({
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

  return { data, totalCount, usersWithAssignedTasks };
}
