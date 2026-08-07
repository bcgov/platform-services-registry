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
  username: z
    .string()
    .trim()
    .min(1)
    .max(39)
    .regex(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i, 'Enter a valid GitHub username.'),
});
