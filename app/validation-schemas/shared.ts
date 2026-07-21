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

const allowedRepositoryHosts = new Set(['github.com', 'bitbucket.org', 'gitlab.com']);

const allowedRepositoryOrganizations = new Set(['bcgov', 'bcgov-c', 'bc-gov']);

export const repositorySchema = z.object({
  url: z
    .string()
    .trim()
    .url('Enter a valid repository URL')
    .refine(
      (value) => {
        try {
          return new URL(value).protocol === 'https:';
        } catch {
          return false;
        }
      },
      {
        message: 'Repository URL must use HTTPS',
      },
    )
    .refine(
      (value) => {
        try {
          const hostname = new URL(value).hostname.toLowerCase();
          return allowedRepositoryHosts.has(hostname);
        } catch {
          return false;
        }
      },
      {
        message: 'Repository must be hosted on GitHub, Bitbucket, or GitLab',
      },
    )
    .refine(
      (value) => {
        try {
          const pathSegments = new URL(value).pathname.toLowerCase().split('/').filter(Boolean);

          return pathSegments.some((segment) => allowedRepositoryOrganizations.has(segment));
        } catch {
          return false;
        }
      },
      {
        message: 'Repository must belong to bcgov, bcgov-c, or bc-gov',
      },
    ),
});

export const repositoriesSchema = z.array(repositorySchema).default([]);

export type User = z.infer<typeof userSchema>;
export type Comment = z.infer<typeof commentSchema>;
