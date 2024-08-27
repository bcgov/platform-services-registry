import { ProjectContext } from '@prisma/client';
import _isString from 'lodash-es/isString';
import { z } from 'zod';

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
