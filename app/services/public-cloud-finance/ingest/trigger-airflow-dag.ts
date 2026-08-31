import { IS_DEV, IS_PROD, IS_TEST } from '@/config';

export function financeIngestDagId() {
  const override = process.env.AIRFLOW_FINANCE_DAG_ID?.trim();
  if (override) return override;
  if (IS_PROD) return 'public_cloud_finance_ingest_prod';
  if (IS_TEST) return 'public_cloud_finance_ingest_test';
  if (IS_DEV) return 'public_cloud_finance_ingest_dev';
  return 'public_cloud_finance_ingest_local';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readAccessToken(payload: unknown) {
  if (!isRecord(payload)) return '';
  if (typeof payload.access_token === 'string') return payload.access_token;
  if (typeof payload.accessToken === 'string') return payload.accessToken;
  return '';
}

export async function triggerFinanceIngestDag(options: {
  triggeredBy: string;
  fetchImpl?: typeof fetch;
}): Promise<{ dagId: string; dagRunId: string }> {
  const base = (process.env.AIRFLOW_API_URL || '').trim().replace(/\/$/, '');
  const username = process.env.AIRFLOW_API_USERNAME || '';
  const password = process.env.AIRFLOW_API_PASSWORD || '';
  if (!base || !username || !password) {
    throw new Error('AIRFLOW_API_URL / AIRFLOW_API_USERNAME / AIRFLOW_API_PASSWORD are required to trigger ingest.');
  }

  const dagId = financeIngestDagId();
  const fetchImpl = options.fetchImpl ?? fetch;
  const tokenResponse = await fetchImpl(`${base}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!tokenResponse.ok) {
    throw new Error(`Airflow auth failed (${tokenResponse.status})`);
  }
  const accessToken = readAccessToken(await tokenResponse.json());
  if (!accessToken) {
    throw new Error('Airflow auth response did not include an access token.');
  }

  const dagRunId = `finance-manual-${Date.now()}`;
  const runResponse = await fetchImpl(`${base}/api/v2/dags/${encodeURIComponent(dagId)}/dagRuns`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dag_run_id: dagRunId,
      logical_date: new Date().toISOString(),
      note: `Triggered by ${options.triggeredBy}`,
    }),
  });
  if (!runResponse.ok) {
    const text = await runResponse.text();
    throw new Error(`Airflow DAG trigger failed (${runResponse.status}): ${text.slice(0, 500)}`);
  }

  return { dagId, dagRunId };
}
