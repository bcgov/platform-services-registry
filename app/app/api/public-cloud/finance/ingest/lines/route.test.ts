import { expect } from '@jest/globals';
import { GlobalRole } from '@/constants';
import { FinanceIngestionStatus } from '@/prisma/client';
import { mockSessionByRole } from '@/services/api-test/core';
import { postFinanceIngestLines } from '@/services/api-test/public-cloud/finance';
import { persistBillingPeriod } from '@/services/public-cloud-finance/ingest/persist-billing-period';

jest.mock('@/services/public-cloud-finance/ingest/persist-billing-period', () => ({
  persistBillingPeriod: jest.fn(),
}));

const mockPersist = persistBillingPeriod as jest.MockedFunction<typeof persistBillingPeriod>;

describe('POST /api/public-cloud/finance/ingest/lines', () => {
  afterEach(() => {
    mockPersist.mockReset();
  });

  it('persists fetched lines', async () => {
    await mockSessionByRole(GlobalRole.Admin);
    mockPersist.mockResolvedValue({
      runId: 'run-1',
      rowsLoaded: 1,
      rowsUnmatched: 0,
      flagsRaised: 0,
      status: FinanceIngestionStatus.SUCCESS,
    });
    const lines = [{ accountIdentifier: '111122223333', serviceLine: 'AmazonEC2', amount: 10, currency: 'USD' }];
    const res = await postFinanceIngestLines({
      provider: 'AWS_LZA',
      year: 2026,
      month: 7,
      lines,
    });
    expect(res.status).toBe(200);
    expect(mockPersist).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'AWS_LZA',
        period: { year: 2026, month: 7 },
        lines,
      }),
    );
  });

  it('rejects classic AWS', async () => {
    await mockSessionByRole(GlobalRole.Admin);
    const res = await postFinanceIngestLines({
      provider: 'AWS',
      year: 2026,
      month: 7,
      lines: [{ accountIdentifier: '1', serviceLine: 'S3', amount: 1, currency: 'USD' }],
    });
    expect(res.status).toBe(400);
    expect(mockPersist).not.toHaveBeenCalled();
  });

  it('returns 409 when ingest is already running', async () => {
    await mockSessionByRole(GlobalRole.Admin);
    mockPersist.mockRejectedValue(new Error('Ingest already running for AWS_LZA 2026-7'));
    const res = await postFinanceIngestLines({
      provider: 'AWS_LZA',
      year: 2026,
      month: 7,
      lines: [{ accountIdentifier: '1', serviceLine: 'S3', amount: 1, currency: 'USD' }],
    });
    expect(res.status).toBe(409);
    expect(res.headers.get('retry-after')).toBe('5');
  });
});
