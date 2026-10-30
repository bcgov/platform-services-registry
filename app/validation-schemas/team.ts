import { z } from 'zod';
import { TeamRole } from '@/prisma/client';
import { objectId } from './common';

const teamMemberRolesSchema = z
  .array(z.enum(TeamRole))
  .min(1, { message: 'Please assign at least one role to a member' });

export const teamMemberBodySchema = z.object({
  userId: objectId,
  roles: teamMemberRolesSchema,
});

export const teamMemberRolesBodySchema = z.object({
  roles: teamMemberRolesSchema,
});

export const teamMembersSchema = z
  .array(teamMemberBodySchema)
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

// Members are changed one at a time through the members endpoints, not through a team update.
export const teamUpdateBodySchema = teamBodySchema.omit({ members: true });

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
export type TeamUpdateBody = z.infer<typeof teamUpdateBodySchema>;
export type TeamMembers = z.infer<typeof teamMembersSchema>;
export type TeamMemberBody = z.infer<typeof teamMemberBodySchema>;
