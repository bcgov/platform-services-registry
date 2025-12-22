import _isNumber from 'lodash-es/isNumber';
import _uniq from 'lodash-es/uniq';
import prisma from '@/core/prisma';
import { parsePaginationParams } from '@/helpers/pagination';
import { Prisma } from '@/prisma/client';
import { TaskSearchBody } from '@/validation-schemas/task';

const defaultSortKey = 'createdAt';
export async function searchTasks({
  types = [],
  statuses = [],
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
}) {
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

  if (types.length > 0) {
    filters.type = { in: types };
  }

  if (statuses.length > 0) {
    filters.status = { in: statuses };
  }

  const orderBy = { [sortKey]: sortOrder };

  const [tasks, totalCount] = await Promise.all([
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
            idir: true,
            upn: true,
          },
        },
      },
    }),
    prisma.task.count({ where: filters }),
  ]);

  const userIds = _uniq(tasks.flatMap((task) => task.userIds ?? []));
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
      idir: true,
      idirGuid: true,
      upn: true,
    },
  });

  const data = tasks.map((task) => {
    return { ...task, users: task.userIds.map((id) => users.find((usr) => usr.id === id)) };
  });

  return { data, totalCount };
}
