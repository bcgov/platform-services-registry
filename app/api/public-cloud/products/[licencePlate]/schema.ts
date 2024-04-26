import { z } from 'zod';

export const getPathParamSchema = z.object({
  licencePlate: z.string(),
});

export const putPathParamSchema = z.object({
  licencePlate: z.string(),
});
