import { chunkLinkedAccountIds, collectAwsCostExplorerRows } from './aws-cost-explorer';
import {
  azureCostQueryBody,
  azureCostQueryUrl,
  azureCostScopeFromEnv,
  fetchAzureCostQueryPages,
  parseAzureCostQueryPayload,
} from './azure-cost-query';

describe('azure cost query helpers', () => {
  const period = { year: 2026, month: 7 };

  it('builds a subscription-scoped query URL', () => {
    expect(azureCostQueryUrl('/subscriptions/abc')).toContain(
      '/subscriptions/abc/providers/Microsoft.CostManagement/query',
    );
  });

  it('groups by subscription when querying an estate scope', () => {
    const body = azureCostQueryBody(period, true);
    expect(body.dataset.grouping).toEqual([
      { type: 'Dimension', name: 'SubscriptionId' },
      { type: 'Dimension', name: 'ServiceName' },
    ]);
  });

  it('parses service rows and nextLink from a subscription query', () => {
    const parsed = parseAzureCostQueryPayload(
      {
        properties: {
          nextLink: 'https://management.azure.com/next',
          columns: [{ name: 'Cost' }, { name: 'ServiceName' }, { name: 'Currency' }],
          rows: [
            [12.5, 'Virtual Machines', 'CAD'],
            [0, 'Storage', 'CAD'],
          ],
        },
      },
      period,
      'sub-1',
    );

    expect(parsed.nextLink).toBe('https://management.azure.com/next');
    expect(parsed.rows).toEqual([
      {
        accountIdentifier: 'sub-1',
        serviceLine: 'Virtual Machines',
        amount: 12.5,
        currency: 'CAD',
        year: 2026,
        month: 7,
      },
    ]);
  });

  it('reads SubscriptionId from estate-scope rows', () => {
    const parsed = parseAzureCostQueryPayload(
      {
        properties: {
          columns: [{ name: 'Cost' }, { name: 'SubscriptionId' }, { name: 'ServiceName' }, { name: 'Currency' }],
          rows: [[40, 'aaaa-bbbb', 'Azure App Service', 'USD']],
        },
      },
      period,
    );

    expect(parsed.hasSubscriptionColumn).toBe(true);
    expect(parsed.rows[0]?.accountIdentifier).toBe('aaaa-bbbb');
    expect(parsed.rows[0]?.serviceLine).toBe('Azure App Service');
  });

  it('retries 429 and follows nextLink', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Headers({ 'retry-after': '0' }),
        text: async () => 'throttled',
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({
          properties: {
            nextLink: 'https://management.azure.com/page-2',
            columns: [{ name: 'Cost' }, { name: 'ServiceName' }, { name: 'Currency' }],
            rows: [[5, 'Storage', 'CAD']],
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
        json: async () => ({
          properties: {
            columns: [{ name: 'Cost' }, { name: 'ServiceName' }, { name: 'Currency' }],
            rows: [[8, 'Virtual Machines', 'CAD']],
          },
        }),
      });

    const rows = await fetchAzureCostQueryPages({
      url: 'https://management.azure.com/subscriptions/sub-1/providers/Microsoft.CostManagement/query',
      body: azureCostQueryBody(period, false),
      accessToken: 'token',
      period,
      fallbackSubscriptionId: 'sub-1',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    expect(rows.map((row) => row.serviceLine)).toEqual(['Storage', 'Virtual Machines']);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it('reads FINANCE_AZURE_COST_SCOPE with a leading slash', () => {
    const previous = process.env.FINANCE_AZURE_COST_SCOPE;
    process.env.FINANCE_AZURE_COST_SCOPE = 'providers/Microsoft.Management/managementGroups/platform';
    expect(azureCostScopeFromEnv()).toBe('/providers/Microsoft.Management/managementGroups/platform');
    if (previous === undefined) delete process.env.FINANCE_AZURE_COST_SCOPE;
    else process.env.FINANCE_AZURE_COST_SCOPE = previous;
  });
});

describe('aws cost explorer helpers', () => {
  it('chunks linked-account filters and keeps a single unfiltered query', () => {
    expect(chunkLinkedAccountIds(undefined)).toEqual([undefined]);
    expect(chunkLinkedAccountIds(['1'.repeat(12)])).toHaveLength(1);
    expect(chunkLinkedAccountIds(Array.from({ length: 101 }, (_, i) => String(i).padStart(12, '0')))).toHaveLength(2);
  });

  it('collects non-zero Cost Explorer groups', () => {
    const rows = collectAwsCostExplorerRows(
      {
        ResultsByTime: [
          {
            Groups: [
              {
                Keys: ['123456789012', 'Amazon EC2'],
                Metrics: { UnblendedCost: { Amount: '9.25', Unit: 'USD' } },
              },
              {
                Keys: ['123456789012', 'Tax'],
                Metrics: { UnblendedCost: { Amount: '0', Unit: 'USD' } },
              },
            ],
          },
        ],
      },
      { year: 2026, month: 7 },
    );

    expect(rows).toEqual([
      {
        accountIdentifier: '123456789012',
        serviceLine: 'Amazon EC2',
        amount: 9.25,
        currency: 'USD',
        year: 2026,
        month: 7,
      },
    ]);
  });
});
