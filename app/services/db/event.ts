import { EventType, Prisma } from '@prisma/client';
import { addDays } from 'date-fns';
import _isNumber from 'lodash-es/isNumber';
import { z } from 'zod';
import { logger } from '@/core/logging';
import prisma from '@/core/prisma';
import { parsePaginationParams } from '@/helpers/pagination';
import { EventSearchBody } from '@/validation-schemas/event';

const validationSchemas = {
  [EventType.CREATE_PRIVATE_CLOUD_PRODUCT]: z.object({
    requestId: z.string().length(24),
  }),
  [EventType.UPDATE_PRIVATE_CLOUD_PRODUCT]: z.object({
    requestId: z.string().length(24),
  }),
  [EventType.DELETE_PRIVATE_CLOUD_PRODUCT]: z.object({
    requestId: z.string().length(24),
  }),
  [EventType.REVIEW_PRIVATE_CLOUD_REQUEST]: z.object({
    requestId: z.string().length(24),
  }),
  [EventType.RESEND_PRIVATE_CLOUD_REQUEST]: z.object({
    requestId: z.string().length(24),
  }),
  [EventType.REPROVISION_PRIVATE_CLOUD_PRODUCT]: z.object({
    licencePlate: z.string().min(6),
  }),
  [EventType.CREATE_PUBLIC_CLOUD_PRODUCT]: z.object({
    requestId: z.string().length(24),
  }),
  [EventType.UPDATE_PUBLIC_CLOUD_PRODUCT]: z.object({
    requestId: z.string().length(24),
  }),
  [EventType.DELETE_PUBLIC_CLOUD_PRODUCT]: z.object({
    requestId: z.string().length(24),
  }),
  [EventType.REVIEW_PUBLIC_CLOUD_REQUEST]: z.object({
    requestId: z.string().length(24),
  }),
  [EventType.RESEND_PUBLIC_CLOUD_REQUEST]: z.object({
    requestId: z.string().length(24),
  }),
};

type SearchEvent = Prisma.EventGetPayload<{
  select: {
    id: true;
    type: true;
    userId: true;
    createdAt: true;
    user: {
      select: {
        firstName: true;
        lastName: true;
        email: true;
        jobTitle: true;
        image: true;
      };
    };
  };
}>;

const defaultSortKey = 'createdAt';

const validationKeys = Object.keys(validationSchemas);

export async function createEvent(type: EventType, userId = '', data = {}) {
  try {
    if (validationKeys.includes(type)) {
      const validationSchame = validationSchemas[type as keyof typeof validationSchemas];

      const parsed = validationSchame.safeParse(data);
      if (!parsed.success) {
        throw Error(`invalid data for event type ${type}: ${JSON.stringify(data)}`);
      }
    }

    const event = await prisma.event.create({
      data: {
        type,
        userId,
        data,
      },
    });

    return event;
  } catch (error) {
    logger.error('createEvent:', error);
  }
}

export async function searchEvents({
  types = [],
  dates = [],
  userId = '',
  search = '',
  skip,
  take,
  page,
  pageSize,
  sortKey = defaultSortKey,
  sortOrder = Prisma.SortOrder.desc,
}: EventSearchBody & {
  skip?: number;
  take?: number;
}): Promise<{ data: SearchEvent[]; totalCount: number }> {
  if (!_isNumber(skip) && !_isNumber(take) && page && pageSize) {
    ({ skip, take } = parsePaginationParams(page, pageSize, 10));
  }

  const filters: Prisma.EventWhereInput = {};
  search = search.trim();

  if (userId) {
    filters.userId = userId;
  } else if (search) {
    filters.OR = [
      { user: { firstName: { contains: search, mode: 'insensitive' } } },
      { user: { lastName: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }

  if (types?.length > 0) {
    filters.type = { in: types };
  }

  if (dates?.length > 0) {
    if (dates.length === 2) {
      filters.AND = [{ createdAt: { gte: dates[0] } }, { createdAt: { lt: addDays(dates[1], 1) } }];
    } else {
      filters.createdAt = { gte: dates[0] };
    }
  }

  const orderBy = { [sortKey]: sortOrder };

  const [data, totalCount] = await Promise.all([
    prisma.event.findMany({
      skip,
      take,
      where: filters,
      orderBy,
      select: {
        id: true,
        type: true,
        userId: true,
        createdAt: true,
        data: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            jobTitle: true,
            image: true,
            ministry: true,
          },
        },
      },
    }),
    prisma.event.count({ where: filters }),
  ]);

  return { data, totalCount };
}
