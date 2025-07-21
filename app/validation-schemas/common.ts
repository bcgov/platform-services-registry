import { z } from 'zod';

export const objectId = z.string().length(24);
export const optionalObjectId = z.string().length(24).or(z.literal('')).optional();
export const yyyyMmDd = z.string().length(10, 'Date must be in YYYY-MM-DD format');

export type ObjectId = z.infer<typeof objectId>;
export type YyyyMmDd = z.infer<typeof yyyyMmDd>;
