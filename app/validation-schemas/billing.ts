import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { processEnumString } from '@/utils/js';

export const billingSearchBodySchema = z.object({
  search: z.string().optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
  billings: z.array(z.string()),
  sortValue: z.string().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.preprocess(processEnumString, z.nativeEnum(Prisma.SortOrder).optional()),
});

export type BillingSearchBody = z.infer<typeof billingSearchBodySchema>;
