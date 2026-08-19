import { z } from 'zod';

export const getPathParamSchema = z.object({
  id: z.string().length(24),
});

export const putPathParamSchema = z.object({
  id: z.string().length(24),
});

export const deletePathParamSchema = z.object({
  id: z.string().length(24),
});

export const githubUserUpdateBodySchema = z.object({
  username: z.string().trim().default(''),
});
