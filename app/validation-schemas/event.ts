import { z } from 'zod';
import { EventType, Prisma } from '@/prisma/client';
import { processEnumString } from '@/utils/js';
import { isValidISODateString } from '@/utils/js';

export const eventsSearchBodySchema = z.object({
  search: z.string().optional(),
  types: z.array(z.nativeEnum(EventType)).optional(),
  dates: z
    .array(z.string().refine(isValidISODateString, { message: 'Invalid ISO 8601 date format.' }))
    .refine((arr) => arr.length === 0 || arr.length === 2, {
      message: 'Must provide either zero dates or exactly two dates.',
    })
    .optional(),
  userId: z.string().length(24).or(z.literal('')).optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
  sortValue: z.string().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.preprocess(processEnumString, z.nativeEnum(Prisma.SortOrder).optional()),
});

export type EventSearchBody = z.infer<typeof eventsSearchBodySchema>;
