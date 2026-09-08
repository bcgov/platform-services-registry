import { Provider } from '@/prisma/client';
import { partitionMatchedUnmatched } from './partition-lines';
import type { NormalizedBillingLine } from './types';

function line(overrides: Partial<NormalizedBillingLine> = {}): NormalizedBillingLine {
  return {
    provider: Provider.AWS,
    accountIdentifier: '111122223333',
    serviceLine: 'EC2',
    year: 2026,
    month: 7,
    amountCad: 10,
    sourceCurrency: 'USD',
    fxRate: 1.35,
    fxRateDate: new Date('2026-07-31'),
    ...overrides,
  };
}

describe('partitionMatchedUnmatched', () => {
  it('matches by provider-qualified account key', () => {
    const { matched, unmatched } = partitionMatchedUnmatched(
      [line({ provider: Provider.AWS_LZA, accountIdentifier: '111122223333' })],
      new Map([['AWS_LZA:111122223333', 'abc123']]),
      new Set(['111122223333']),
    );
    expect(matched).toHaveLength(1);
    expect(matched[0]?.licencePlate).toBe('abc123');
    expect(unmatched).toHaveLength(0);
  });

  it('does not queue an account that belongs to another provider', () => {
    const { matched, unmatched } = partitionMatchedUnmatched(
      [line({ provider: Provider.AWS, accountIdentifier: '111122223333' })],
      new Map([['AWS_LZA:111122223333', 'abc123']]),
      new Set(['111122223333']),
    );
    expect(matched).toHaveLength(0);
    expect(unmatched).toHaveLength(0);
  });

  it('queues truly unknown accounts', () => {
    const { unmatched } = partitionMatchedUnmatched(
      [line({ accountIdentifier: '999988887777' })],
      new Map(),
      new Set(),
    );
    expect(unmatched).toHaveLength(1);
  });

  it('queues same-provider collisions instead of dropping them', () => {
    const { matched, unmatched } = partitionMatchedUnmatched(
      [line({ provider: Provider.AZURE, accountIdentifier: 'aaaa-bbbb' })],
      new Map(),
      new Set(['aaaa-bbbb']),
      ['AZURE:aaaa-bbbb'],
    );
    expect(matched).toHaveLength(0);
    expect(unmatched).toHaveLength(1);
  });
});
