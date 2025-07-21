import { z } from 'zod';

export const organizationBodySchema = z.object({
  code: z
    .string()
    .min(2, 'Code must be at least 2 characters long')
    .max(10, 'Code must be at most 10 characters long')
    .refine((val) => val === val.toUpperCase(), {
      message: 'Code must be uppercase',
    }),
  name: z.string().min(2, 'Name must be at least 2 characters long').max(50, 'Name must be at most 50 characters long'),
});

export type OrganizationBody = z.infer<typeof organizationBodySchema>;
