import { z } from 'zod';
import { Cluster, Ministry } from '@/prisma/client';
import { isValidISODateString } from '@/utils/js';

export const analyticsPrivateCloudFilterSchema = z.object({
  ministries: z.array(z.nativeEnum(Ministry)).optional(),
  clusters: z.array(z.nativeEnum(Cluster)).optional(),
  temporary: z.array(z.enum(['YES', 'NO'])).optional(),
  dates: z
    .array(z.string().refine(isValidISODateString, { message: 'Invalid ISO 8601 date format.' }))
    .refine((arr) => arr.length <= 2, {
      message: 'Must provide at most two dates (start and/or end).',
    })
    .transform((arr) => {
      if (arr.length === 1) {
        return [arr[0], new Date().toISOString()];
      }
      return arr;
    }),
  userId: z.string().length(24).or(z.literal('')).optional(),
});

export type AnalyticsPrivateCloudFilterBody = z.infer<typeof analyticsPrivateCloudFilterSchema>;
