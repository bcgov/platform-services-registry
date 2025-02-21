import { z } from 'zod';
import { isValidISODateString } from '@/utils/js';

export const analyticsGeneralFilterSchema = z.object({
  dates: z
    .array(z.string().refine(isValidISODateString, { message: 'Invalid ISO 8601 date format.' }))
    .refine((arr) => arr.length === 0 || arr.length === 2, {
      message: 'Must provide either zero dates or exactly two dates.',
    })
    .optional(),
  userId: z.string().length(24).or(z.literal('')).optional(),
});

export type AnalyticsGeneralFilterBody = z.infer<typeof analyticsGeneralFilterSchema>;
