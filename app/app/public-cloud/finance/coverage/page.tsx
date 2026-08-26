'use client';

import { Select } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import FinanceNav from '@/components/public-cloud/finance/FinanceNav';
import FinancePreviewDisabled from '@/components/public-cloud/finance/FinancePreviewDisabled';
import FinanceQueryState from '@/components/public-cloud/finance/FinanceQueryState';
import { GlobalPermissions } from '@/constants';
import createClientPage from '@/core/client-page';
import { getFinanceCoverage } from '@/services/backend/public-cloud/finance';

const publicCloudFinanceCoveragePage = createClientPage({
  permissions: [GlobalPermissions.ViewPublicCloudForecast],
});

export default publicCloudFinanceCoveragePage(({ session }) => {
  const [stateFilter, setStateFilter] = useState<string>('all');
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['finance-coverage'],
    queryFn: getFinanceCoverage,
    enabled: Boolean(session?.previews.publicCloudFinance),
  });

  const rows = useMemo(() => {
    const products = data?.products ?? [];
    if (stateFilter === 'all') return products;
    return products.filter((p: { coverageState: string }) => p.coverageState === stateFilter);
  }, [data, stateFilter]);

  if (!session?.previews.publicCloudFinance) return <FinancePreviewDisabled />;

  return (
    <div className="pt-5">
      <h1 className="text-xl lg:text-2xl font-semibold mb-2">Forecast coverage and chase list</h1>
      <p className="text-sm text-gray-600 mb-4">
        Internal. Who is missing a forecast, and has anyone asked them. Reminder send is out of scope; the last-reminder
        column is reserved.
      </p>
      <FinanceNav />

      <Select
        className="mb-4 max-w-xs"
        label="Coverage state"
        value={stateFilter}
        onChange={(v) => setStateFilter(v || 'all')}
        data={[
          { value: 'all', label: 'All' },
          { value: 'missing', label: 'Missing' },
          { value: 'incomplete', label: 'Incomplete' },
          { value: 'complete', label: 'Complete' },
        ]}
      />

      <FinanceQueryState
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        title="Could not load forecast coverage"
        isReady={Boolean(data) && !isLoading}
      >
        {data && (
          <table className="min-w-full text-sm border bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-2 text-left">
                  Project identifier
                </th>
                <th scope="col" className="px-3 py-2 text-left">
                  Name
                </th>
                <th scope="col" className="px-3 py-2 text-left">
                  Coverage
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  Months missing
                </th>
                <th scope="col" className="px-3 py-2 text-left">
                  Product Owner
                </th>
                <th scope="col" className="px-3 py-2 text-left">
                  Last reminder sent
                </th>
                <th scope="col" className="px-3 py-2 text-left">
                  Remind
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-4 text-sm text-gray-500">
                    No active products to chase.
                  </td>
                </tr>
              ) : null}
              {rows.map(
                (row: {
                  licencePlate: string;
                  name: string;
                  coverageState: string;
                  monthsMissing: number;
                  projectOwnerName: string;
                  projectOwnerEmail: string;
                  lastReminderSentAt: string | null;
                }) => (
                  <tr key={row.licencePlate}>
                    <td className="px-3 py-2 font-mono text-xs">{row.licencePlate}</td>
                    <td className="px-3 py-2">{row.name}</td>
                    <td className="px-3 py-2">{row.coverageState}</td>
                    <td className="px-3 py-2 text-right">{row.monthsMissing}</td>
                    <td className="px-3 py-2">
                      {row.projectOwnerName}
                      <div className="text-xs text-gray-500">{row.projectOwnerEmail}</div>
                    </td>
                    <td className="px-3 py-2 text-gray-500">{row.lastReminderSentAt ?? '—'}</td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        className="text-xs text-gray-400 cursor-not-allowed"
                        disabled
                        title="Reminder send is out of scope for the prototype"
                      >
                        Send reminder
                      </button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        )}
      </FinanceQueryState>
    </div>
  );
});
