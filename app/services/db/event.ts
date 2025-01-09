import { EventType, Prisma } from '@prisma/client';
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
  events = [],
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
  const isEventSearch = events.length > 0;

  if (!_isNumber(skip) && !_isNumber(take) && page && pageSize) {
    ({ skip, take } = parsePaginationParams(page, pageSize, 10));
  }

  if (!Object.values(Prisma.SortOrder).includes(sortOrder)) {
    throw new Error(`Invalid sortOrder: ${sortOrder}`);
  }

  const filters: Prisma.EventWhereInput = {};

  if (search.trim()) {
    filters.OR = [
      { user: { firstName: { contains: search, mode: 'insensitive' } } },
      { user: { lastName: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }

  if (isEventSearch) {
    filters.type = { in: events };
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
          },
        },
      },
    }),
    prisma.event.count({ where: filters }),
  ]);

  return { data, totalCount };
}
