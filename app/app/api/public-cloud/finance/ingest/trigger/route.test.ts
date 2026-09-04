import { expect } from '@jest/globals';
import { POST as triggerFinanceIngestDagRoute } from '@/app/api/public-cloud/finance/ingest/trigger/route';
import { GlobalRole } from '@/constants';
import { createRoute, mockSessionByRole } from '@/services/api-test/core';
import { triggerFinanceIngestDag } from '@/services/public-cloud-finance/ingest/trigger-airflow-dag';

jest.mock('@/services/public-cloud-finance/ingest/trigger-airflow-dag', () => ({
  triggerFinanceIngestDag: jest.fn(),
}));

const mockTrigger = triggerFinanceIngestDag as jest.MockedFunction<typeof triggerFinanceIngestDag>;
const financeRoute = createRoute('/public-cloud/finance');

function postTrigger() {
  return financeRoute.post(triggerFinanceIngestDagRoute, '/ingest/trigger', {});
}

describe('POST /api/public-cloud/finance/ingest/trigger', () => {
  afterEach(() => {
    mockTrigger.mockReset();
  });

  it('queues the Airflow DAG', async () => {
    await mockSessionByRole(GlobalRole.Admin);
    mockTrigger.mockResolvedValue({ dagId: 'public_cloud_finance_ingest_dev', dagRunId: 'finance-manual-1' });
    const res = await postTrigger();
    expect(res.status).toBe(200);
    expect(mockTrigger).toHaveBeenCalled();
  });
});
