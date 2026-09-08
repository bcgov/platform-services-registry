import { Provider } from '@/prisma/client';
import { planUnmatchedReconcile } from './unmatched-reconcile';

const base = {
  provider: Provider.AZURE,
  accountIdentifier: 'sub-1',
  serviceLine: 'VMs',
  year: 2026,
  month: 6,
};

describe('planUnmatchedReconcile', () => {
  it('keeps resolved rows and updates unresolved amounts in place', () => {
    const plan = planUnmatchedReconcile(
      [
        { ...base, id: 'resolved', amountCad: 10, resolvedTo: 'abc123' },
        { ...base, accountIdentifier: 'sub-2', id: 'open', amountCad: 20, resolvedTo: null },
      ],
      [
        { ...base, amountCad: 10 },
        { ...base, accountIdentifier: 'sub-2', amountCad: 25 },
      ],
    );

    expect(plan.staleIds).toEqual([]);
    expect(plan.toCreate).toEqual([]);
    expect(plan.toUpdate).toEqual([
      { id: 'open', amountCad: 25, sourceCurrency: undefined, fxRate: undefined, fxRateDate: undefined },
    ]);

    const fxDate = new Date('2026-06-30T00:00:00Z');
    const fxPlan = planUnmatchedReconcile(
      [{ ...base, accountIdentifier: 'sub-2', id: 'open-fx', amountCad: 25, sourceCurrency: 'USD', fxRate: 1.3 }],
      [
        {
          ...base,
          accountIdentifier: 'sub-2',
          amountCad: 25,
          sourceCurrency: 'USD',
          fxRate: 1.35,
          fxRateDate: fxDate,
        },
      ],
    );
    expect(fxPlan.toUpdate).toEqual([
      { id: 'open-fx', amountCad: 25, sourceCurrency: 'USD', fxRate: 1.35, fxRateDate: fxDate },
    ]);
  });

  it('deletes stale unresolved rows and creates new ones', () => {
    const plan = planUnmatchedReconcile(
      [{ ...base, id: 'old', amountCad: 10, resolvedTo: null }],
      [{ ...base, accountIdentifier: 'sub-new', amountCad: 40 }],
    );

    expect(plan.staleIds).toEqual(['old']);
    expect(plan.toCreate).toHaveLength(1);
  });
});
