import { Provider, SpendFlagRuleId } from '@/prisma/client';
import { planSpendFlagReconcile, shouldEvaluateSpendFlags } from './evaluate-flags';

const base = {
  licencePlate: 'abc123',
  provider: Provider.AWS,
  year: 2026,
  month: 6,
  ruleId: SpendFlagRuleId.MOM_INCREASE,
};

describe('planSpendFlagReconcile', () => {
  it('creates new flags and deletes stale unreviewed ones', () => {
    const plan = planSpendFlagReconcile(
      [
        {
          ...base,
          id: 'stale',
          currentAmountCad: 100,
          priorAmountCad: 50,
        },
      ],
      [
        {
          ...base,
          licencePlate: 'new456',
          currentAmountCad: 200,
          priorAmountCad: 80,
        },
      ],
    );

    expect(plan.staleIds).toEqual(['stale']);
    expect(plan.toCreate).toHaveLength(1);
    expect(plan.toUpdate).toEqual([]);
  });

  it('updates amounts on matching keys without treating them as create or delete', () => {
    const plan = planSpendFlagReconcile(
      [
        {
          ...base,
          id: 'keep',
          currentAmountCad: 100,
          priorAmountCad: 50,
        },
      ],
      [
        {
          ...base,
          currentAmountCad: 180,
          priorAmountCad: 50,
        },
      ],
    );

    expect(plan.staleIds).toEqual([]);
    expect(plan.toCreate).toEqual([]);
    expect(plan.toUpdate).toEqual([{ id: 'keep', currentAmountCad: 180, priorAmountCad: 50 }]);
  });

  it('leaves unchanged flags untouched, treating null prior as missing', () => {
    const plan = planSpendFlagReconcile(
      [
        {
          ...base,
          id: 'same',
          ruleId: SpendFlagRuleId.NEW_SERVICE_LINE,
          serviceLine: 'EC2',
          currentAmountCad: 250,
          priorAmountCad: null,
        },
      ],
      [
        {
          ...base,
          ruleId: SpendFlagRuleId.NEW_SERVICE_LINE,
          serviceLine: 'EC2',
          currentAmountCad: 250,
        },
      ],
    );

    expect(plan.staleIds).toEqual([]);
    expect(plan.toCreate).toEqual([]);
    expect(plan.toUpdate).toEqual([]);
  });

  it('does not recreate a flag that was already reviewed', () => {
    const plan = planSpendFlagReconcile(
      [],
      [{ ...base, currentAmountCad: 200, priorAmountCad: 80 }],
      ['abc123:AWS::MOM_INCREASE'],
    );

    expect(plan.toCreate).toEqual([]);
  });
});

describe('shouldEvaluateSpendFlags', () => {
  it('skips the in-progress calendar month', () => {
    const now = new Date('2026-08-15T12:00:00');
    expect(shouldEvaluateSpendFlags({ year: 2026, month: 8 }, now)).toBe(false);
    expect(shouldEvaluateSpendFlags({ year: 2026, month: 7 }, now)).toBe(true);
  });
});
