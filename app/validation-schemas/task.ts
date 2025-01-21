import { TaskType, Prisma } from '@prisma/client';
import { z } from 'zod';
import { processEnumString } from '@/utils/js';

export const taskSearchBodySchema = z.object({
  search: z.string().optional(),
  tasks: z.array(z.nativeEnum(TaskType)),
  page: z.number().optional(),
  pageSize: z.number().optional(),
  sortValue: z.string().optional(),
  sortKey: z.string().optional(),
  sortOrder: z.preprocess(processEnumString, z.nativeEnum(Prisma.SortOrder).optional()),
});

export type TaskSearchBody = z.infer<typeof taskSearchBodySchema>;
