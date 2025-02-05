import { RequestType } from '@prisma/client';
import _isString from 'lodash-es/isString';
import { z } from 'zod';

export const RequestDecision = {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type RequestDecision = (typeof RequestDecision)[keyof typeof RequestDecision];

export const userSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be 50 characters or less'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be 50 characters or less'),
  email: z
    .string()
    .email('Invalid email address')
    .transform((email) => email.toLowerCase()),

  ministry: z.string().min(1, 'Ministry is required').max(50, 'Ministry must be 50 characters or less'),
  idir: z.string(),
  upn: z.string(),
  // ministry: z.nativeEnum(Ministry), // Not using ministry enum as a new ministry may not be in our system yet
});

export const deleteRequestDecisionBodySchema = z.object({
  type: z.literal(RequestType.DELETE),
  decision: z.nativeEnum(RequestDecision),
  decisionComment: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;
