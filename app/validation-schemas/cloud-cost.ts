import { z } from 'zod';
import { Provider } from '@/prisma/client';

const billingPeriodSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
});

const providerSchema = z.enum([Provider.AWS, Provider.AWS_LZA, Provider.AZURE]);

const currencySchema = z.enum(['USD', 'CAD']);

export const cspMonthlyTotalSchema = z.object({
  billingPeriod: billingPeriodSchema,
  currency: currencySchema,
  actualTotal: z.number().min(0),
  forecastTotal: z.number().min(0).optional(),
  varianceAmount: z.number().optional(),
  variancePercent: z.number().optional(),
});

export const cspConsumptionHistorySchema = z.object({
  licencePlate: z.string().min(1),
  provider: providerSchema,
  months: z.array(cspMonthlyTotalSchema).min(1),
});

export type CspConsumptionHistory = z.infer<typeof cspConsumptionHistorySchema>;

export const forecastMonthlyValueSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  amount: z.number().min(0),
  currency: z.enum(['USD', 'CAD']),
});

export const cloudCostForecastBodySchema = z.object({
  monthlyValues: z.array(forecastMonthlyValueSchema).min(1),
  horizonMonths: z.number().int().min(1).max(36).default(24),
});

export type CloudCostForecastBody = z.infer<typeof cloudCostForecastBodySchema>;

export const accountabilityExportQuerySchema = z.object({
  format: z.enum(['csv', 'xlsx']).optional().default('xlsx'),
});

export type AccountabilityExportQuery = z.infer<typeof accountabilityExportQuerySchema>;
