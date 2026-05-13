import { z } from 'zod';
import { objectId } from './common';

const jsonValueSchema = z.any().optional();

export const teamMemberSchema = z.object({
  userId: objectId,
  roles: z.array(z.string().min(1)).default([]),
});

export const teamBodySchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  code: z
    .string()
    .min(1, { message: 'Code is required.' })
    .regex(/^[a-z0-9-]+$/i, 'Code may only contain letters, numbers, and hyphens'),
  description: z.string().optional().nullable(),
  metadata: jsonValueSchema,
  rules: jsonValueSchema,
  policies: jsonValueSchema,
  mappings: jsonValueSchema,
  members: z.array(teamMemberSchema).default([]),
});

export const linkSystemBodySchema = z.object({
  systemId: objectId,
});

export const linkPrivateCloudProductBodySchema = z.object({
  privateCloudProductId: objectId,
});

export const linkPublicCloudProductBodySchema = z.object({
  publicCloudProductId: objectId,
});

export const updateMembersBodySchema = z.object({
  members: z.array(teamMemberSchema),
});

export type TeamBody = z.infer<typeof teamBodySchema>;
