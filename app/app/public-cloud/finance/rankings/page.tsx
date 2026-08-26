'use client';

import { NumberInput, Select, SegmentedControl } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import LoadingBox from '@/components/generic/LoadingBox';
import { formatCadAmount, formatPercent } from '@/components/public-cloud/finance/finance-measure-utils';
import FinanceNav from '@/components/public-cloud/finance/FinanceNav';
import FinanceQueryError from '@/components/public-cloud/finance/FinanceQueryError';
import { GlobalPermissions } from '@/constants';
import createClientPage from '@/core/client-page';
import { Provider } from '@/prisma/client';
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

  if (!session?.previews.publicCloudFinance) return null;

  return (
    <div className="pt-5">
      <h1 className="text-xl lg:text-2xl font-semibold mb-2">Cost transparency rankings</h1>
      <p className="text-sm text-gray-600 mb-4">Where is the money actually going.</p>
      <FinanceNav />

      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <SegmentedControl
          value={provider}
          onChange={setProvider}
          data={[
            { label: 'All', value: 'ALL' },
            { label: 'AWS LZA', value: Provider.AWS_LZA },
            { label: 'Azure', value: Provider.AZURE },
            { label: 'AWS', value: Provider.AWS },
          ]}
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
      </div>

      {isError ? (
        <FinanceQueryError error={error} onRetry={() => refetch()} title="Could not load rankings" />
      ) : isLoading || !data ? (
        <LoadingBox isLoading>
          <div className="min-h-24" />
        </LoadingBox>
      ) : (
        <div className="space-y-8">
          <p className="text-sm text-gray-600">
            Filtered total: {formatCadAmount(data.filteredTotalCad)} · {data.fiscalYearLabel}
          </p>
          <section>
            <h2 className="text-lg font-semibold mb-2">Products by spend</h2>
            <table className="min-w-full text-sm border bg-white">
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
                    <tr key={row.licencePlate}>
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
            </table>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Service lines by spend</h2>
            <table className="min-w-full text-sm border bg-white">
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
                {data.serviceLines.map(
                  (row: {
                    rank: number;
                    serviceLine: string;
                    amountCad: number;
                    shareOfTotal: number;
                    yoyChangePercent: number | null;
                  }) => (
                    <tr key={row.serviceLine}>
                      <td className="px-3 py-2">{row.rank}</td>
                      <td className="px-3 py-2">{row.serviceLine}</td>
                      <td className="px-3 py-2 text-right">{formatCadAmount(row.amountCad)}</td>
                      <td className="px-3 py-2 text-right">{formatPercent(row.shareOfTotal * 100, 1)}</td>
                      <td className="px-3 py-2 text-right">{formatPercent(row.yoyChangePercent, 1)}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </section>
        </div>
      )}
    </div>
  );
});
