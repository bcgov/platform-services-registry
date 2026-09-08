import type { Prisma } from '@/prisma/client';

/**
 * Prisma MongoDB does not match missing optional fields with `{ field: null }`.
 * Active ActualSpend rows are created without supersededBy set, so queries must
 * include `{ isSet: false }` as well as explicit null.
 */
export const activeActualSpendWhere: Prisma.ActualSpendWhereInput = {
  OR: [{ supersededBy: null }, { supersededBy: { isSet: false } }],
};

/** Unresolved unmatched rows. Missing `resolvedTo` is not the same as `null` on Mongo. */
export const unresolvedUnmatchedWhere: Prisma.UnmatchedBillingLineWhereInput = {
  OR: [{ resolvedTo: null }, { resolvedTo: { isSet: false } }],
};

/** Unreviewed flags. Missing `reviewedAt` is not the same as `null` on Mongo. */
export const unreviewedSpendFlagWhere: Prisma.SpendFlagWhereInput = {
  OR: [{ reviewedAt: null }, { reviewedAt: { isSet: false } }],
};
