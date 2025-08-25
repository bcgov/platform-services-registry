import { addDays } from 'date-fns';
import _isNumber from 'lodash-es/isNumber';
import { z } from 'zod';
import { logger } from '@/core/logging';
import prisma from '@/core/prisma';
import { parsePaginationParams } from '@/helpers/pagination';
import { EventType, Prisma } from '@/prisma/client';
import { objectId } from '@/validation-schemas';
import { EventSearchBody } from '@/validation-schemas/event';
import { organizationBodySchema } from '@/validation-schemas/organization';

const requestIdSchema = z.object({
  requestId: z.string().length(24),
});

const licencePlateSchema = z.object({
  licencePlate: z.string().min(6),
});

const validationSchemas = {
  [EventType.CREATE_TEAM_API_TOKEN]: z.object({
    clientUid: z.string(),
  }),
  [EventType.UPDATE_TEAM_API_TOKEN]: z.object({
    clientUid: z.string(),
    users: z
      .array(
        z.object({
          email: z.string().email(),
          type: z.enum(['add', 'remove']),
        }),
      )
      .optional(),
    roles: z.array(z.string()).optional(),
    result: z
      .array(
        z.object({
          success: z.boolean(),
          email: z.email(),
          error: z.string().optional(),
        }),
      )
      .optional(),
  }),
  [EventType.DELETE_TEAM_API_TOKEN]: z.object({
    clientUid: z.string(),
  }),
  [EventType.CREATE_API_TOKEN]: z.undefined(),
  [EventType.DELETE_API_TOKEN]: z.undefined(),

  [EventType.CREATE_PRIVATE_CLOUD_PRODUCT]: requestIdSchema,
  [EventType.UPDATE_PRIVATE_CLOUD_PRODUCT]: requestIdSchema,
  [EventType.DELETE_PRIVATE_CLOUD_PRODUCT]: requestIdSchema,
  [EventType.REVIEW_PRIVATE_CLOUD_REQUEST]: requestIdSchema,
  [EventType.RESEND_PRIVATE_CLOUD_REQUEST]: requestIdSchema,
  [EventType.CANCEL_PRIVATE_CLOUD_REQUEST]: requestIdSchema,
  [EventType.REPROVISION_PRIVATE_CLOUD_PRODUCT]: licencePlateSchema,

  [EventType.CREATE_PUBLIC_CLOUD_PRODUCT]: requestIdSchema,
  [EventType.UPDATE_PUBLIC_CLOUD_PRODUCT]: requestIdSchema,
  [EventType.DELETE_PUBLIC_CLOUD_PRODUCT]: requestIdSchema,
  [EventType.REVIEW_PUBLIC_CLOUD_REQUEST]: requestIdSchema,
  [EventType.RESEND_PUBLIC_CLOUD_REQUEST]: requestIdSchema,
  [EventType.CANCEL_PUBLIC_CLOUD_REQUEST]: requestIdSchema,

  [EventType.CREATE_ORGANIZATION]: z.object({
    id: objectId,
    data: organizationBodySchema,
  }),
  [EventType.UPDATE_ORGANIZATION]: z.object({
    id: objectId,
    old: organizationBodySchema,
    new: organizationBodySchema,
  }),
  [EventType.DELETE_ORGANIZATION]: z.object({
    id: objectId,
    to: objectId,
    data: organizationBodySchema,
  }),
  [EventType.LOGIN]: z.undefined(),
  [EventType.LOGOUT]: z.undefined(),
  [EventType.EXPORT_PRIVATE_CLOUD_PRODUCT]: z.any(),
  [EventType.EXPORT_PUBLIC_CLOUD_PRODUCT]: z.any(),
};

type EventDataMap = {
  [K in keyof typeof validationSchemas]: z.infer<(typeof validationSchemas)[K]>;
};

export async function createEvent<T extends keyof typeof validationSchemas>(
  type: T,
  userId = '',
  data?: EventDataMap[T],
) {
  try {
    const validationSchema = validationSchemas[type];

    // Validate only if schema is not z.any()
    if (validationSchema && validationSchema !== z.any()) {
      const parsed = validationSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(`Invalid data for event type ${type}: ${JSON.stringify(parsed.error.format())}`);
      }
    }

    return await prisma.event.create({
      data: {
        type,
        userId,
        data: (data ?? {}) as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    logger.error('createEvent error:', error);
    throw error;
  }
}

const defaultSortKey = 'createdAt';

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
            upn: true,
            idir: true,
          },
        },
      },
    }),
    prisma.event.count({ where: filters }),
  ]);

  return { data, totalCount };
}
