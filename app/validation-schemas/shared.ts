import _isString from 'lodash-es/isString';
import { z } from 'zod';

export const requestDecisionEnum = z.enum(['APPROVED', 'REJECTED']);

export const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be 50 characters or less'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be 50 characters or less'),
  email: z
    .string()
    .email('Invalid email address')
    .transform((email) => email.toLowerCase()),

  ministry: z.string().min(1, 'Ministry is required').max(50, 'Ministry must be 50 characters or less'),
  idir: z.string().optional().nullable(),
  upn: z.string().optional().nullable(),
  // ministry: z.nativeEnum(Ministry), // Not using ministry enum as a new ministry may not be in our system yet
});

export type User = z.infer<typeof userSchema>;
export type RequestDecision = z.infer<typeof requestDecisionEnum>;
