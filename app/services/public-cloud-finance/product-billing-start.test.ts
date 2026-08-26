import { productExistedDuringMonth } from '@/components/public-cloud/finance/finance-measure-utils';
import { platesToRollupForPeriod, resolveBillingStartedAt } from './product-billing-start';

describe('product billing start', () => {
  it('prefers provisionedDate over createdAt', () => {
    expect(resolveBillingStartedAt(new Date('2026-04-01T00:00:00Z'), new Date('2026-08-15T00:00:00Z'))).toEqual(
      new Date('2026-08-15T00:00:00Z'),
    );
    expect(resolveBillingStartedAt(new Date('2026-04-01T00:00:00Z'), undefined)).toEqual(
      new Date('2026-04-01T00:00:00Z'),
    );
  });

  it('treats the UTC month of provision as in scope and earlier months as out of scope', () => {
    const started = new Date('2026-08-15T12:00:00Z');
    expect(productExistedDuringMonth(started, 2026, 7)).toBe(false);
    expect(productExistedDuringMonth(started, 2026, 8)).toBe(true);
    expect(productExistedDuringMonth(started, 2026, 9)).toBe(true);
  });

  it('writes rollups for products that existed in the period and any matched plates', () => {
    expect(
      platesToRollupForPeriod({
        products: [
          { licencePlate: 'old1', billingStartedAt: new Date('2026-04-01T00:00:00Z') },
          { licencePlate: 'new1', billingStartedAt: new Date('2026-08-01T00:00:00Z') },
        ],
        period: { year: 2026, month: 6 },
        matchedPlates: ['matched-late'],
      }).sort(),
    ).toEqual(['matched-late', 'old1']);
  });
});
