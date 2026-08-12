import type { Prisma } from '@/prisma/client';

/**
 * Prisma MongoDB does not match missing optional fields with `{ field: null }`.
 * Active ActualSpend rows are created without supersededBy set, so queries must
 * include `{ isSet: false }` as well as explicit null.
 */
export const activeActualSpendWhere: Prisma.ActualSpendWhereInput = {
  OR: [{ supersededBy: null }, { supersededBy: { isSet: false } }],
};
