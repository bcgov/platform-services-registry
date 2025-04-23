import { z } from 'zod';
import { ProjectContext } from '@/prisma/client';

export const securityConfigSchema = z.object({
  licencePlate: z.string(),
  repositories: z
    .array(
      z.object({
        url: z
          .string()
          .url()
          .refine(
            (value) => /^https:\/\/github\.com\/bcgov\/[a-zA-Z0-9_-]+$/.test(value),
            "Please enter GitHub 'bcgov' organization's repository URL. (https://github.com/bcgov/<repo>)",
          ),
      }),
    )
    .max(10),
  context: z.union([z.literal(ProjectContext.PRIVATE), z.literal(ProjectContext.PUBLIC)]),
  clusterOrProvider: z.string().optional(),
});

export type SecurityConfig = z.infer<typeof securityConfigSchema>;
