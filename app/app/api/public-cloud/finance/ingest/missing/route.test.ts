import { expect } from '@jest/globals';
import { GET as getFinanceIngestMissing } from '@/app/api/public-cloud/finance/ingest/missing/route';
import { currentCalendarMonth } from '@/components/public-cloud/finance/finance-measure-utils';
import { GlobalRole } from '@/constants';
import { Provider } from '@/prisma/client';
import { createRoute, mockSessionByRole } from '@/services/api-test/core';
import { listScheduledIngestPlan } from '@/services/public-cloud-finance/ingest/missing-periods';

jest.mock('@/services/public-cloud-finance/ingest/missing-periods', () => ({
  listScheduledIngestPlan: jest.fn(),
}));

const mockPlan = listScheduledIngestPlan as jest.MockedFunction<typeof listScheduledIngestPlan>;
const financeRoute = createRoute('/public-cloud/finance');

function getMissing(queryParams?: { year?: number; month?: number }) {
  return financeRoute.get(getFinanceIngestMissing, '/ingest/missing', queryParams ? { queryParams } : undefined);
}

describe('GET /api/public-cloud/finance/ingest/missing', () => {
  afterEach(() => {
    mockPlan.mockReset();
  });

  it('returns the scheduled ingest plan for the requested month', async () => {
    await mockSessionByRole(GlobalRole.Admin);
    const plan = {
      through: { year: 2026, month: 7 },
      providers: [{ provider: Provider.AWS_LZA, periods: [{ year: 2026, month: 7 }] }],
    };
    mockPlan.mockResolvedValue(plan);

    const res = await getMissing({ year: 2026, month: 7 });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(plan);
    expect(mockPlan).toHaveBeenCalledWith({ year: 2026, month: 7 });
  });

  it('defaults through to the current calendar month', async () => {
    await mockSessionByRole(GlobalRole.Admin);
    mockPlan.mockResolvedValue({ through: currentCalendarMonth(), providers: [] });

    const res = await getMissing();
    expect(res.status).toBe(200);
    expect(mockPlan).toHaveBeenCalledWith(currentCalendarMonth());
  });
});
