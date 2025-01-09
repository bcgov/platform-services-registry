import { EventType, Prisma } from '@prisma/client';
import { z } from 'zod';
import { processEnumString } from '@/utils/js';

export const eventsSearchBodySchema = z.object({
  search: z.string().optional(),
  events: z.array(z.string()).transform((events) => {
    return events.filter((event) => Object.values(EventType).includes(event as EventType)) as EventType[];
  }),
  page: z.number().optional(),
  pageSize: z.number().optional(),
  sortValue: z.string().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.preprocess(processEnumString, z.nativeEnum(Prisma.SortOrder).optional()),
});

export type EventSearchBody = z.infer<typeof eventsSearchBodySchema>;
