import { z } from 'zod';
import { Prisma } from '@/prisma/types';
import { processEnumString } from '@/utils/js';

export const userSearchBodySchema = z.object({
  search: z.string().optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
  roles: z.array(z.string()),
  sortValue: z.string().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.preprocess(processEnumString, z.nativeEnum(Prisma.SortOrder).optional()),
});

export const userUpdateBodySchema = z.object({
  roles: z.array(z.string()).nullable().optional(),
  onboardingDate: z.string().nullable().optional(),
});

export type UserSearchBody = z.infer<typeof userSearchBodySchema>;
export type UserUpdateBody = z.infer<typeof userUpdateBodySchema>;
