import { z } from 'zod';
import { yyyyMmDd } from '@/validation-schemas/common';

export const getPathParamSchema = z.object({
  date: yyyyMmDd,
});

export const putPathParamSchema = z.object({
  date: yyyyMmDd,
});

export const deletePathParamSchema = z.object({
  date: yyyyMmDd,
});
