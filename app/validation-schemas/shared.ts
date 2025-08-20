import { z } from 'zod';
import { RequestType } from '@/prisma/client';

export const RequestDecision = {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type RequestDecision = (typeof RequestDecision)[keyof typeof RequestDecision];

export const commentSchema = z
  .string()
  .trim()
  .min(1, { message: 'Invalid input, expected a non-empty comment' })
  .max(1000);

export const optionalCommentSchema = z.string().trim().nullable().default(null).optional();

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
  // ministry: z.enum(Ministry), // Not using ministry enum as a new ministry may not be in our system yet
});

export const deleteRequestApproveBodySchema = z.object({
  type: z.literal(RequestType.DELETE),
  decision: z.literal(RequestDecision.APPROVED),
  decisionComment: optionalCommentSchema,
});

export const deleteRequestRejectBodySchema = z.object({
  type: z.literal(RequestType.DELETE),
  decision: z.literal(RequestDecision.REJECTED),
  decisionComment: commentSchema,
});

export type User = z.infer<typeof userSchema>;
export type Comment = z.infer<typeof commentSchema>;
