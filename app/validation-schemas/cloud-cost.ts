import { z } from 'zod';

export const forecastMonthlyValueSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  amount: z.number().min(0),
  currency: z.literal('CAD'),
});

export const cloudCostForecastBodySchema = z.object({
  monthlyValues: z.array(forecastMonthlyValueSchema).min(1),
  horizonMonths: z.number().int().min(1).max(36).default(24),
});

export type CloudCostForecastBody = z.infer<typeof cloudCostForecastBodySchema>;

export const forecastExportQuerySchema = z.object({
  format: z.enum(['csv', 'xlsx']).optional().default('xlsx'),
});

export type ForecastExportQuery = z.infer<typeof forecastExportQuerySchema>;

export const financeProviderQuerySchema = z.object({
  provider: z.enum(['ALL', 'AWS', 'AWS_LZA', 'AZURE']).optional().default('ALL'),
});

export const financeRankingsQuerySchema = financeProviderQuerySchema.extend({
  organizationId: z.string().optional(),
  period: z.enum(['ytd', 'full-fy']).optional().default('ytd'),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const financeExportQuerySchema = z.object({
  format: z.enum(['csv', 'xlsx']).optional().default('xlsx'),
  provider: z.enum(['ALL', 'AWS', 'AWS_LZA', 'AZURE']).optional().default('ALL'),
  period: z.enum(['ytd', 'full-fy']).optional().default('ytd'),
  datasets: z.string().optional().default('forecast,actuals,variance,product-rankings,service-line-rankings'),
});

export const financeAnomalyQuerySchema = z.object({
  includeReviewed: z
    .enum(['true', 'false'])
    .optional()
    .default('false')
    .transform((v) => v === 'true'),
});

export const financeReviewFlagBodySchema = z.object({
  reviewNote: z.string().min(1).max(4000),
});

export const financeResolveUnmatchedBodySchema = z.object({
  licencePlate: z.string().min(1).max(32),
});

export const varianceNoteBodySchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  body: z.string().min(1).max(8000),
  supersedesNoteId: z.string().optional(),
});

export const financeIngestBodySchema = z.object({
  provider: z.enum(['AWS', 'AWS_LZA', 'AZURE']),
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  licencePlates: z.array(z.string()).optional(),
  useSimulated: z.boolean().optional(),
});
