import { z } from 'zod';

export const organizationBodySchema = z.object({
  code: z
    .string()
    .min(2, 'Code must be at least 2 characters long')
    .max(10, 'Code must be at most 10 characters long')
    .refine((val) => val === val.toUpperCase(), {
      message: 'Code must be uppercase',
    }),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name must be at most 100 characters long'),
  isAgMinistry: z.boolean(),
});

export const organizationDeleteBodySchema = z.object({
  fromOrganizationId: z.string().length(24),
  toOrganizationId: z.string().length(24),
});

export type OrganizationBody = z.infer<typeof organizationBodySchema>;
export type OrganizationDeleteBody = z.infer<typeof organizationDeleteBodySchema>;
