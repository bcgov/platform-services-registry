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

export interface RepositoryFormData {
  hasRepositories?: boolean | null;
  repositories?: Array<{ url: string }>;
}
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

export const hasRepositoriesSchema = z.boolean().nullable().optional().default(null);

const unsafeRepositoryProtocols = new Set(['javascript:', 'data:', 'vbscript:']);

// The validation has minimal restrictions:
// The value must be a correctly formatted URL.
// Unsafe protocols are rejected: javascript: data: vbscript:
// The Git hosting provider is not restricted.
// HTTP, HTTPS, Git, SSH, SVN, file and other valid URL protocols are allowed.
// Self-hosted Git servers are allowed.
// There are no restrictions on the organization, owner, domain, or repository name.

export const repositorySchema = z.object({
  url: z
    .url('Enter a valid repository URL')
    .refine((value) => !unsafeRepositoryProtocols.has(new URL(value).protocol.toLowerCase()), {
      message: 'Enter a safe repository URL',
    }),
});

export function validateRepositorySelection(data: RepositoryFormData, ctx: z.RefinementCtx) {
  const repositories = data.repositories ?? [];

  if (data.hasRepositories === true && repositories.length === 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['repositories'],
      message: 'Add at least one repository URL',
    });
  }

  if (data.hasRepositories !== true && repositories.length > 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['hasRepositories'],
      message: 'Select Yes when repository URLs are provided',
    });
  }
}

export const repositoriesSchema = z.array(repositorySchema).default([]);

export type User = z.infer<typeof userSchema>;
export type Comment = z.infer<typeof commentSchema>;
