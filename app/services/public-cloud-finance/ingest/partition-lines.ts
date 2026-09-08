import { accountJoinKey } from '../billing-account-links';
import type { NormalizedBillingLine } from './types';

/**
 * Join billing lines to products. Same-provider collisions stay unmatched.
 * Accounts known only on another provider are skipped so an AWS ingest does
 * not queue LZA accounts (those dollars attach on the LZA ingest).
 */
export function partitionMatchedUnmatched(
  lines: NormalizedBillingLine[],
  accountMap: Map<string, string>,
  knownAccountIds: Set<string>,
  collisions: Iterable<string> = [],
) {
  const collisionKeys = collisions instanceof Set ? collisions : new Set(collisions);
  const matched: Array<NormalizedBillingLine & { licencePlate: string }> = [];
  const unmatched: NormalizedBillingLine[] = [];

  for (const line of lines) {
    const key = accountJoinKey(line.provider, line.accountIdentifier);
    const licencePlate = accountMap.get(key);
    if (licencePlate) {
      matched.push({ ...line, licencePlate });
      continue;
    }
    if (collisionKeys.has(key)) {
      unmatched.push(line);
      continue;
    }
    if (knownAccountIds.has(line.accountIdentifier.trim().toLowerCase())) {
      continue;
    }
    unmatched.push(line);
  }

  return { matched, unmatched };
}
