import _isString from 'lodash-es/isString';
import { z } from 'zod';

export const teamApiAccountSchema = z.object({
  roles: z.array(z.string()),
  users: z.array(
    z.object({
      email: z.string().email().min(5),
    }),
  ),
});

export type TeamApiAccount = z.infer<typeof teamApiAccountSchema>;
