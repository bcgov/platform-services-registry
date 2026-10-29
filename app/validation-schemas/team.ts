import { z } from 'zod';
import { TeamMemberRole } from '@/prisma/client';
import { objectId } from './common';

export const teamMembersSchema = z
  .array(
    z.object({
      userId: objectId,
      roles: z.array(z.enum(TeamMemberRole)).min(1, { message: 'Please assign at least one role to a member' }),
    }),
  )
  .refine((members) => new Set(members.map((member) => member.userId)).size === members.length, {
    message: 'Each user can only be added to a team once',
  });

export const teamBodySchema = z.object({
  name: z.string().trim().min(1, { message: 'Name is required.' }).max(100),
  code: z
    .string()
    .trim()
    .min(2, 'Code must be at least 2 characters long')
    .max(30, 'Code must be at most 30 characters long')
    .regex(/^[A-Z0-9-]+$/, 'Code may only contain uppercase letters, numbers and hyphens'),
  description: z.string().max(1000).optional().nullable(),
  members: teamMembersSchema.default([]),
});

export const teamMembersBodySchema = z.object({
  members: teamMembersSchema,
});

export const teamListQuerySchema = z.object({
  includeArchived: z
    .preprocess((value) => value === 'true' || value === true, z.boolean())
    .optional()
    .default(false),
});

export const teamArchiveBodySchema = z.object({
  ids: z.array(objectId).min(1),
});

export type TeamBody = z.infer<typeof teamBodySchema>;
export type TeamMembers = z.infer<typeof teamMembersSchema>;
