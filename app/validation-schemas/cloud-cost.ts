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
