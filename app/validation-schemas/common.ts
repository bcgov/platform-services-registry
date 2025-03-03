import { z } from 'zod';

export const objectId = z.string().length(24);
export const optionalObjectId = z.string().length(24).or(z.literal('')).optional();
