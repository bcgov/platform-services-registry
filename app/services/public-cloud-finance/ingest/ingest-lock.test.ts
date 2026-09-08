import { Provider } from '@/prisma/client';
import { financeIngestLockKey, INGEST_LOCK_TTL_MS, isIngestLockStale } from './ingest-lock';

describe('finance ingest lock key', () => {
  it('is unique per provider and calendar month', () => {
    expect(financeIngestLockKey(Provider.AWS_LZA, { year: 2026, month: 7 })).toBe('AWS_LZA:2026-7');
    expect(financeIngestLockKey(Provider.AZURE, { year: 2026, month: 7 })).toBe('AZURE:2026-7');
  });

  it('treats locks older than the TTL as stale so a crashed pod can be reclaimed', () => {
    const now = new Date('2026-08-26T12:00:00Z');
    expect(isIngestLockStale(new Date(now.getTime() - INGEST_LOCK_TTL_MS - 1), now)).toBe(true);
    expect(isIngestLockStale(new Date(now.getTime() - INGEST_LOCK_TTL_MS + 1_000), now)).toBe(false);
  });
});
