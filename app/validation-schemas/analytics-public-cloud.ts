import { z } from 'zod';
import { Provider, Ministry } from '@/prisma/client';
import { isValidISODateString } from '@/utils/js';

export const analyticsPublicCloudFilterSchema = z.object({
  ministries: z.array(z.nativeEnum(Ministry)).optional(),
  providers: z.array(z.nativeEnum(Provider)).optional(),
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

export type AnalyticsPublicCloudFilterBody = z.infer<typeof analyticsPublicCloudFilterSchema>;
