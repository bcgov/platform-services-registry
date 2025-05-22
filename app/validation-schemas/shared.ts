import { z } from 'zod';
import { RequestType } from '@/prisma/client';

export const RequestDecision = {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type RequestDecision = (typeof RequestDecision)[keyof typeof RequestDecision];

const baseCommentSchema = z.string().trim().max(1000);

export const commentSchema = baseCommentSchema.min(1, { message: 'Invalid input, expected a non-empty comment' });

export const optionalCommentSchema = baseCommentSchema
  .transform((comment) => (comment === '' ? null : comment))
  .nullable()
  .optional();

export const userSchema = z.object({
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
  decisionComment: commentSchema,
});

export type User = z.infer<typeof userSchema>;
export type Comment = z.infer<typeof commentSchema>;
