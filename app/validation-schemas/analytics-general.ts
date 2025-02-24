import { z } from 'zod';
import { isValidISODateString } from '@/utils/js';

export const analyticsGeneralFilterSchema = z.object({
  dates: z
    .array(z.string().refine(isValidISODateString, { message: 'Invalid ISO 8601 date format.' }))
    .refine((arr) => arr.length <= 2, {
      message: 'Must provide at most two dates (start and/or end).',
    })
    .transform((arr) => {
      if (arr.length === 1) {
        // If only start date is provided, auto-fill end date as today
        return [arr[0], new Date().toISOString()];
      }
      return arr;
    }),
  userId: z.string().length(24).or(z.literal('')).optional(),
});

export type AnalyticsGeneralFilterBody = z.infer<typeof analyticsGeneralFilterSchema>;
