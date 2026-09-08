import { expect } from '@jest/globals';
import { GlobalRole } from '@/constants';
import prisma from '@/core/prisma';
import { Provider, SpendFlagRuleId } from '@/prisma/client';
import { mockSessionByRole } from '@/services/api-test/core';
import { postFinanceReviewAnomaly } from '@/services/api-test/public-cloud/finance';

const MISSING_ID = 'bbbbbbbbbbbbbbbbbbbbbbbb';

describe('POST /api/public-cloud/finance/anomalies/:id/review', () => {
  it('rejects a path id that is not an ObjectId', async () => {
    await mockSessionByRole(GlobalRole.Admin);
    const res = await postFinanceReviewAnomaly('not-an-id', 'looks fine');
    expect(res.status).toBe(400);
  });

  it('returns 400 when the flag does not exist', async () => {
    await mockSessionByRole(GlobalRole.Admin);
    const res = await postFinanceReviewAnomaly(MISSING_ID, 'looks fine');
    expect(res.status).toBe(400);
  });

  it('marks an unreviewed flag as reviewed', async () => {
    await mockSessionByRole(GlobalRole.Admin);
    const flag = await prisma.spendFlag.create({
      data: {
        licencePlate: 'finflg1',
        provider: Provider.AWS_LZA,
        serviceLine: 'Amazon Elastic Compute Cloud',
        year: 2026,
        month: 7,
        ruleId: SpendFlagRuleId.MOM_INCREASE,
        currentAmountCad: 200,
        priorAmountCad: 100,
      },
    });
    const res = await postFinanceReviewAnomaly(flag.id, 'Expected growth');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.reviewNote).toBe('Expected growth');
    expect(body.reviewedAt).toBeTruthy();
  });
});
