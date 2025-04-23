import { z } from 'zod';
import { TaskType, Prisma, TaskStatus } from '@/prisma/client';
import { processEnumString } from '@/utils/js';

export const taskSearchBodySchema = z.object({
  search: z.string().optional(),
  types: z.array(z.nativeEnum(TaskType)),
  statuses: z.array(z.nativeEnum(TaskStatus)),
  page: z.number().optional(),
  pageSize: z.number().optional(),
  sortValue: z.string().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.preprocess(processEnumString, z.nativeEnum(Prisma.SortOrder).optional()),
});

export type TaskSearchBody = z.infer<typeof taskSearchBodySchema>;
