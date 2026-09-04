import { triggerFinanceIngestDag } from './trigger-airflow-dag';

describe('triggerFinanceIngestDag', () => {
  const previous = {
    url: process.env.AIRFLOW_API_URL,
    user: process.env.AIRFLOW_API_USERNAME,
    pass: process.env.AIRFLOW_API_PASSWORD,
    dag: process.env.AIRFLOW_FINANCE_DAG_ID,
  };

  beforeEach(() => {
    process.env.AIRFLOW_API_URL = 'https://airflow.example.gov';
    process.env.AIRFLOW_API_USERNAME = 'finance';
    process.env.AIRFLOW_API_PASSWORD = 'secret'; // pragma: allowlist secret
    process.env.AIRFLOW_FINANCE_DAG_ID = 'public_cloud_finance_ingest_test';
  });

  afterEach(() => {
    if (previous.url === undefined) delete process.env.AIRFLOW_API_URL;
    else process.env.AIRFLOW_API_URL = previous.url;
    if (previous.user === undefined) delete process.env.AIRFLOW_API_USERNAME;
    else process.env.AIRFLOW_API_USERNAME = previous.user;
    if (previous.pass === undefined) delete process.env.AIRFLOW_API_PASSWORD;
    else process.env.AIRFLOW_API_PASSWORD = previous.pass;
    if (previous.dag === undefined) delete process.env.AIRFLOW_FINANCE_DAG_ID;
    else process.env.AIRFLOW_FINANCE_DAG_ID = previous.dag;
  });

  it('authenticates and triggers the finance DAG', async () => {
    let triggerUrl = '';
    let triggerBody: { logical_date?: string } = {};
    const fetchImpl = jest.fn(async (url: string, init?: RequestInit) => {
      if (url.endsWith('/auth/token')) {
        return new Response(JSON.stringify({ access_token: 'tok' }), { status: 200 });
      }
      triggerUrl = url;
      triggerBody = JSON.parse(String(init?.body));
      return new Response('{}', { status: 200 });
    });

    const result = await triggerFinanceIngestDag({
      triggeredBy: 'admin@example.gov',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(result.dagId).toBe('public_cloud_finance_ingest_test');
    expect(result.dagRunId).toMatch(/^finance-manual-/);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(triggerUrl).toContain('/api/v2/dags/public_cloud_finance_ingest_test/dagRuns');
    expect(triggerBody.logical_date).toEqual(expect.any(String));
  });

  it('throws when Airflow API env is missing', async () => {
    delete process.env.AIRFLOW_API_URL;
    await expect(triggerFinanceIngestDag({ triggeredBy: 'admin' })).rejects.toThrow(/AIRFLOW_API_URL/);
  });
});
