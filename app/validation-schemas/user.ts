import { Prisma } from '@prisma/client';
import _isString from 'lodash-es/isString';
import { z } from 'zod';
import { processEnumString, processUpperEnumString, processBoolean } from '@/utils/zod';

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
  roles: z.array(z.string()),
});

export type UserSearchBody = z.infer<typeof userSearchBodySchema>;
export type UserUpdateBody = z.infer<typeof userUpdateBodySchema>;
