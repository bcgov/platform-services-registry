import { z } from 'zod';
import { SystemStatus } from '@/prisma/client';
import { objectId } from './common';

const jsonValueSchema = z.any().optional();

export const systemBodySchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  code: z
    .string()
    .min(1, { message: 'Code is required.' })
    .regex(/^[a-z0-9-]+$/i, 'Code may only contain letters, numbers, and hyphens'),
  description: z.string().optional().nullable(),
  status: z.enum(SystemStatus).default(SystemStatus.ACTIVE),
  organizationId: objectId.optional().nullable(),
  metadata: jsonValueSchema,
  rules: jsonValueSchema,
  policies: jsonValueSchema,
  mappings: jsonValueSchema,
});

export const linkTeamBodySchema = z.object({
  teamId: objectId,
});

export const linkPrivateCloudProductBodySchema = z.object({
  privateCloudProductId: objectId,
});

export const linkPublicCloudProductBodySchema = z.object({
  publicCloudProductId: objectId,
});

export type SystemBody = z.infer<typeof systemBodySchema>;
