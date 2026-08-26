import { expect } from '@jest/globals';
import { GlobalRole } from '@/constants';
import { mockSessionByRole } from '@/services/api-test/core';
import { postFinanceIngest } from '@/services/api-test/public-cloud/finance';
import { ingestBillingPeriod } from '@/services/public-cloud-finance/ingest/run-ingest';

jest.mock('@/services/public-cloud-finance/ingest/run-ingest', () => ({
  ingestBillingPeriod: jest.fn(),
}));

const mockIngest = ingestBillingPeriod as jest.MockedFunction<typeof ingestBillingPeriod>;

describe('POST /api/public-cloud/finance/ingest', () => {
  afterEach(() => {
    mockIngest.mockReset();
  });

  it('rejects classic AWS on the real billing path', async () => {
    await mockSessionByRole(GlobalRole.Admin);
    const res = await postFinanceIngest({
      provider: 'AWS',
      year: 2026,
      month: 7,
      useSimulated: false,
    });
    expect(res.status).toBe(400);
    expect(mockIngest).not.toHaveBeenCalled();
  });

  it('rejects simulated ingest when the billing source is real', async () => {
    const previous = process.env.FINANCE_BILLING_SOURCE;
    process.env.FINANCE_BILLING_SOURCE = 'real';
    try {
      await mockSessionByRole(GlobalRole.Admin);
      const res = await postFinanceIngest({
        provider: 'AWS_LZA',
        year: 2026,
        month: 7,
        useSimulated: true,
      });
      expect(res.status).toBe(400);
      expect(mockIngest).not.toHaveBeenCalled();
    } finally {
      if (previous === undefined) delete process.env.FINANCE_BILLING_SOURCE;
      else process.env.FINANCE_BILLING_SOURCE = previous;
    }
  });

  it('returns 400 when scoped ingest has no account IDs', async () => {
    await mockSessionByRole(GlobalRole.Admin);
    mockIngest.mockRejectedValue(
      new Error('Scoped AWS_LZA ingest resolved no billing account IDs for the given licence plates.'),
    );
    const res = await postFinanceIngest({
      provider: 'AWS_LZA',
      year: 2026,
      month: 7,
      useSimulated: false,
      licencePlates: ['abc123'],
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 when ingest is already running', async () => {
    await mockSessionByRole(GlobalRole.Admin);
    mockIngest.mockRejectedValue(new Error('Ingest already running for AWS_LZA 2026-7'));
    const res = await postFinanceIngest({
      provider: 'AWS_LZA',
      year: 2026,
      month: 7,
      useSimulated: false,
    });
    expect(res.status).toBe(400);
  });

  it('returns 500 when the provider adapter fails', async () => {
    await mockSessionByRole(GlobalRole.Admin);
    mockIngest.mockRejectedValue(new Error('Unable to acquire Azure management token'));
    const res = await postFinanceIngest({
      provider: 'AZURE',
      year: 2026,
      month: 7,
      useSimulated: false,
    });
    expect(res.status).toBe(500);
  });
});
