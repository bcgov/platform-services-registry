import { z } from 'zod';
import { ProjectContext } from '@/prisma/client';
import { hasRepositoriesSchema, repositoriesSchema, validateRepositorySelection } from './shared';

export const securityConfigSchema = z
  .object({
    licencePlate: z.string(),
    repositories: repositoriesSchema,
    hasRepositories: hasRepositoriesSchema,
    context: z.union([z.literal(ProjectContext.PRIVATE), z.literal(ProjectContext.PUBLIC)]),
    clusterOrProvider: z.string().optional(),
  })
  .superRefine(validateRepositorySelection);

export type SecurityConfigInput = z.input<typeof securityConfigSchema>;
export type SecurityConfig = z.infer<typeof securityConfigSchema>;
