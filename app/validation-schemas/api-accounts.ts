import _isString from 'lodash-es/isString';
import { z } from 'zod';

export const teamApiAccountSchema = z.object({
  name: z.string().min(1).max(50),
  roles: z.array(z.string()),
  users: z.array(
    z.object({
      email: z.string().email().min(5),
    }),
  ),
});

export type TeamApiAccount = z.infer<typeof teamApiAccountSchema>;
