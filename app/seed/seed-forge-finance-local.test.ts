import { Provider } from '@/prisma/client';
import { inferForgeProvider, parseForgeFinanceTargets } from './seed-forge-finance-local';

describe('parseForgeFinanceTargets', () => {
  it('pairs plates to AWS and Azure account IDs', () => {
    expect(parseForgeFinanceTargets('abc123,def456', '123456789012,00000000-0000-0000-0000-000000000001')).toEqual([
      { licencePlate: 'abc123', accountIdentifier: '123456789012', provider: Provider.AWS_LZA },
      {
        licencePlate: 'def456',
        accountIdentifier: '00000000-0000-0000-0000-000000000001',
        provider: Provider.AZURE,
      },
    ]);
  });

  it('returns nothing when both env values are empty', () => {
    expect(parseForgeFinanceTargets('', '')).toEqual([]);
  });

  it('rejects mismatched list lengths', () => {
    expect(() => parseForgeFinanceTargets('abc123', '123456789012,00000000-0000-0000-0000-000000000001')).toThrow(
      /same length/,
    );
  });
});

describe('inferForgeProvider', () => {
  it('treats a 12-digit id as AWS LZA', () => {
    expect(inferForgeProvider('123456789012')).toBe(Provider.AWS_LZA);
  });

  it('treats a UUID as Azure', () => {
    expect(inferForgeProvider('00000000-0000-0000-0000-000000000001')).toBe(Provider.AZURE);
  });
});
