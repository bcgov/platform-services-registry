'use client';

import { NumberInput, Select, SegmentedControl } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { formatCadAmount, formatPercent } from '@/components/public-cloud/finance/finance-measure-utils';
import FinancePageHeader from '@/components/public-cloud/finance/FinancePageHeader';
import FinancePreviewDisabled from '@/components/public-cloud/finance/FinancePreviewDisabled';
import FinanceQueryState from '@/components/public-cloud/finance/FinanceQueryState';
import FinanceTable, { financeTableRowClassName } from '@/components/public-cloud/finance/FinanceTable';
import { GlobalPermissions, financeProviderFilterOptions } from '@/constants';
import createClientPage from '@/core/client-page';
import { getFinanceRankings } from '@/services/backend/public-cloud/finance';

const publicCloudFinanceRankingsPage = createClientPage({
  permissions: [GlobalPermissions.ViewPublicCloudForecast],
});

export default publicCloudFinanceRankingsPage(({ session }) => {
  const [provider, setProvider] = useState('ALL');
  const [period, setPeriod] = useState<'ytd' | 'full-fy'>('ytd');
  const [limit, setLimit] = useState(10);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['finance-rankings', provider, period, limit],
    queryFn: () => getFinanceRankings({ provider, period, limit }),
    enabled: Boolean(session?.previews.publicCloudFinance),
  });

  if (!session?.previews.publicCloudFinance) return <FinancePreviewDisabled />;

  return (
    <div className="pt-5">
      <FinancePageHeader
        title="Cost transparency rankings"
        description="Products and service lines ranked by spend for the selected period."
      />

      <div className="mb-2 flex flex-wrap gap-4 items-end">
        <SegmentedControl
          value={provider}
          onChange={setProvider}
          data={[{ label: 'All providers', value: 'ALL' }, ...financeProviderFilterOptions]}
          aria-label="Provider filter"
        />
        <Select
          label="Period"
          value={period}
          onChange={(v) => setPeriod((v as 'ytd' | 'full-fy') || 'ytd')}
          data={[
            { value: 'ytd', label: 'Fiscal year to date' },
            { value: 'full-fy', label: 'Full fiscal year' },
          ]}
        />
        <NumberInput
          label="Row count"
          value={limit}
          min={1}
          max={100}
          onChange={(v) => setLimit(typeof v === 'number' ? v : 10)}
        />
        {data ? (
          <p className="text-sm text-gray-600 pb-1">
            Filtered total: {formatCadAmount(data.filteredTotalCad)} · {data.fiscalYearLabel}
          </p>
        ) : null}
      </div>

      <FinanceQueryState
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        title="Could not load rankings"
        isReady={Boolean(data) && !isLoading}
      >
        {data && (
          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold mb-2">Products by spend</h2>
              <FinanceTable caption="Products ranked by spend">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left">
                      Rank
                    </th>
                    <th scope="col" className="px-3 py-2 text-left">
                      Project identifier
                    </th>
                    <th scope="col" className="px-3 py-2 text-left">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-2 text-right">
                      Amount
                    </th>
                    <th scope="col" className="px-3 py-2 text-right">
                      Share
                    </th>
                    <th scope="col" className="px-3 py-2 text-right">
                      YoY
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-sm text-gray-500">
                        No product rankings for this filter.
                      </td>
                    </tr>
                  ) : null}
                  {data.products.map(
                    (row: {
                      rank: number;
                      licencePlate: string;
                      name: string;
                      status?: string;
                      amountCad: number;
                      shareOfTotal: number;
                      yoyChangePercent: number | null;
                    }) => (
                      <tr key={row.licencePlate} className={financeTableRowClassName}>
                        <td className="px-3 py-2">{row.rank}</td>
                        <td className="px-3 py-2 font-mono text-xs">{row.licencePlate}</td>
                        <td className="px-3 py-2">
                          {row.name}
                          {row.status === 'INACTIVE' ? (
                            <span className="ml-2 text-xs text-gray-500">(archived)</span>
                          ) : null}
                        </td>
                        <td className="px-3 py-2 text-right">{formatCadAmount(row.amountCad)}</td>
                        <td className="px-3 py-2 text-right">{formatPercent(row.shareOfTotal * 100, 1)}</td>
                        <td className="px-3 py-2 text-right">{formatPercent(row.yoyChangePercent, 1)}</td>
                      </tr>
                    ),
                  )}
                </tbody>
              </FinanceTable>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-2">Service lines by spend</h2>
              <FinanceTable caption="Service lines ranked by spend">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left">
                      Rank
                    </th>
                    <th scope="col" className="px-3 py-2 text-left">
                      Service line
                    </th>
                    <th scope="col" className="px-3 py-2 text-right">
                      Amount
                    </th>
                    <th scope="col" className="px-3 py-2 text-right">
                      Share
                    </th>
                    <th scope="col" className="px-3 py-2 text-right">
                      YoY
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.serviceLines.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-4 text-sm text-gray-500">
                        No service line rankings for this filter.
                      </td>
                    </tr>
                  ) : null}
                  {data.serviceLines.map(
                    (row: {
                      rank: number;
                      serviceLine: string;
                      amountCad: number;
                      shareOfTotal: number;
                      yoyChangePercent: number | null;
                    }) => (
                      <tr key={row.serviceLine} className={financeTableRowClassName}>
                        <td className="px-3 py-2">{row.rank}</td>
                        <td className="px-3 py-2">{row.serviceLine}</td>
                        <td className="px-3 py-2 text-right">{formatCadAmount(row.amountCad)}</td>
                        <td className="px-3 py-2 text-right">{formatPercent(row.shareOfTotal * 100, 1)}</td>
                        <td className="px-3 py-2 text-right">{formatPercent(row.yoyChangePercent, 1)}</td>
                      </tr>
                    ),
                  )}
                </tbody>
              </FinanceTable>
            </section>
          </div>
        )}
      </FinanceQueryState>
    </div>
  );
});
