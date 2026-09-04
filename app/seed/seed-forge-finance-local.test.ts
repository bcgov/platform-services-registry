import { Provider } from '@/prisma/client';
import { inferForgeProvider, parseForgeAccountToken, parseForgeFinanceTargets } from './seed-forge-finance-local';

describe('parseForgeFinanceTargets', () => {
  it('pairs plates to AWS and Azure account IDs', () => {
    expect(parseForgeFinanceTargets('abc123,def456', '123456789012,00000000-0000-0000-0000-000000000001')).toEqual([
      {
        licencePlate: 'abc123',
        accounts: [{ accountIdentifier: '123456789012', environment: 'development' }],
        provider: Provider.AWS_LZA,
      },
      {
        licencePlate: 'def456',
        accounts: [{ accountIdentifier: '00000000-0000-0000-0000-000000000001', environment: 'development' }],
        provider: Provider.AZURE,
      },
    ]);
  });

  it('parses env accounts for one plate', () => {
    expect(parseForgeFinanceTargets('abc123', '111122223333:dev|444455556666:test|777788889999:prod')).toEqual([
      {
        licencePlate: 'abc123',
        accounts: [
          { accountIdentifier: '111122223333', environment: 'development' },
          { accountIdentifier: '444455556666', environment: 'test' },
          { accountIdentifier: '777788889999', environment: 'production' },
        ],
        provider: Provider.AWS_LZA,
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

  it('rejects mixed AWS and Azure ids on one plate', () => {
    expect(() =>
      parseForgeFinanceTargets('abc123', '123456789012:dev|00000000-0000-0000-0000-000000000001:test'),
    ).toThrow(/only AWS accounts or only Azure/);
  });
});

describe('parseForgeAccountToken', () => {
  it('defaults a bare id to development', () => {
    expect(parseForgeAccountToken('123456789012')).toEqual({
      accountIdentifier: '123456789012',
      environment: 'development',
    });
  });

  it('rejects an unknown environment', () => {
    expect(() => parseForgeAccountToken('123456789012:stage')).toThrow(/Unknown account environment/);
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
