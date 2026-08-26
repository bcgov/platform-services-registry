import { Provider } from '@/prisma/client';
import { financeIngestLockKey } from './ingest-lock';

describe('finance ingest lock key', () => {
  it('is unique per provider and calendar month', () => {
    expect(financeIngestLockKey(Provider.AWS_LZA, { year: 2026, month: 7 })).toBe('AWS_LZA:2026-7');
    expect(financeIngestLockKey(Provider.AZURE, { year: 2026, month: 7 })).toBe('AZURE:2026-7');
  });
});
