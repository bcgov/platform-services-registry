import { z } from 'zod';

export const objectId = z.string().length(24);
export const optionalObjectId = z.string().length(24).or(z.literal('')).optional();
export const yyyyMmDd = z.string().length(10, 'Date must be in YYYY-MM-DD format');
export const yyyy = z.string().length(4, 'Year must be in YYYY format');

export type YyyyMmDd = z.infer<typeof yyyyMmDd>;
export type Yyyy = z.infer<typeof yyyy>;
