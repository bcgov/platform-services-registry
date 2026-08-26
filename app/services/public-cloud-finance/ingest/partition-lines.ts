import { accountJoinKey } from '../billing-account-links';
import type { NormalizedBillingLine } from './types';

/**
 * Join billing lines to products. Accounts known on another provider (or a
 * collision omitted from the map) are skipped so an AWS ingest does not queue
 * LZA accounts as unmatched, and vice versa.
 */
export function partitionMatchedUnmatched(
  lines: NormalizedBillingLine[],
  accountMap: Map<string, string>,
  knownAccountIds: Set<string>,
) {
  const matched: Array<NormalizedBillingLine & { licencePlate: string }> = [];
  const unmatched: NormalizedBillingLine[] = [];

  for (const line of lines) {
    const licencePlate = accountMap.get(accountJoinKey(line.provider, line.accountIdentifier));
    if (licencePlate) {
      matched.push({ ...line, licencePlate });
      continue;
    }
    if (knownAccountIds.has(line.accountIdentifier.trim().toLowerCase())) {
      continue;
    }
    unmatched.push(line);
  }

  return { matched, unmatched };
}
