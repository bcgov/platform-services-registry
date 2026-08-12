'use client';

import { SegmentedControl } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import LoadingBox from '@/components/generic/LoadingBox';
import { formatCadAmount, formatPercent } from '@/components/public-cloud/finance/finance-measure-utils';
import FinanceNav from '@/components/public-cloud/finance/FinanceNav';
import { formatForecastProviderLabel } from '@/components/public-cloud/forecast/forecast-grid-utils';
import { GlobalPermissions } from '@/constants';
import createClientPage from '@/core/client-page';
import { Provider } from '@/prisma/client';
import { getFinanceSnapshot } from '@/services/backend/public-cloud/finance';

type ProviderFilter = 'ALL' | 'AWS_LZA' | 'AZURE' | 'AWS';

function SummaryCard({ label, value, hint }: Readonly<{ label: string; value: string; hint?: string }>) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 bg-white">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </div>
  );
}

function monthStatusLabel(row: { isCurrentPartial: boolean; isElapsed: boolean }) {
  if (row.isCurrentPartial) return 'Current month (partial)';
  if (row.isElapsed) return 'Elapsed';
  return 'Future';
}

const publicCloudFinancePage = createClientPage({
  permissions: [GlobalPermissions.ViewPublicCloudForecast],
});

export default publicCloudFinancePage(({ session }) => {
  const [provider, setProvider] = useState<ProviderFilter>('ALL');
  const { data, isLoading } = useQuery({
    queryKey: ['finance-snapshot', provider],
    queryFn: () => getFinanceSnapshot(provider),
    enabled: Boolean(session?.previews.publicCloudFinance),
  });

  if (!session?.previews.publicCloudFinance) return null;

  return (
    <div className="pt-5">
      <h1 className="text-xl lg:text-2xl 2xl:text-3xl font-semibold leading-7 text-gray-900 mb-2">
        Public Cloud financial snapshot
      </h1>
      <p className="text-sm text-gray-600 mb-4">
        What are we spending, on what, and is it on plan. Internal finance view.
      </p>
      <FinanceNav />

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <SegmentedControl
          value={provider}
          onChange={(value) => setProvider(value as ProviderFilter)}
          data={[
            { label: 'All providers', value: 'ALL' },
            { label: 'AWS LZA', value: Provider.AWS_LZA },
            { label: 'Azure', value: Provider.AZURE },
            { label: 'AWS', value: Provider.AWS },
          ]}
          aria-label="Provider filter"
        />
      </div>

      {isLoading || !data ? (
        <LoadingBox isLoading>
          <div className="min-h-24" />
        </LoadingBox>
      ) : (
        <div className="space-y-6">
          {data.lowCoverage && (
            <output className="block rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              Forecast coverage is {formatPercent(data.coverage.percent, 1)} ({data.coverage.completeCount} of{' '}
              {data.coverage.productCount} products). Variance is not meaningful at this coverage — showing actuals-only
              reporting for the estate this page describes.
            </output>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <SummaryCard
              label={`FYTD actual (${data.fiscalYearLabel})`}
              value={formatCadAmount(data.fytdActual)}
              hint={`Through last complete month ${data.lastCompleteMonth.year}-${String(
                data.lastCompleteMonth.month,
              ).padStart(2, '0')}`}
            />
            <SummaryCard
              label="Full year forecast"
              value={formatCadAmount(data.fullYearForecast)}
              hint={
                data.coverage.excludedFromForecastTotals > 0
                  ? `Excludes ${data.coverage.excludedFromForecastTotals} products with no forecast`
                  : undefined
              }
            />
            <SummaryCard
              label="Variance to forecast"
              value={
                data.lowCoverage || !data.variance
                  ? '—'
                  : `${formatCadAmount(data.variance.amount)} (${formatPercent(data.variance.percent, 1)})`
              }
              hint={data.lowCoverage ? 'No data — coverage too low' : undefined}
            />
            <SummaryCard
              label="Forecast coverage"
              value={formatPercent(data.coverage.percent, 1)}
              hint={`${data.coverage.completeCount} / ${data.coverage.productCount} products with full 24-month values`}
            />
          </div>

          <section aria-labelledby="monthly-chart-heading">
            <h2 id="monthly-chart-heading" className="text-lg font-semibold mb-2">
              Monthly actual vs forecast
            </h2>
            <p className="text-xs text-gray-500 mb-2">
              Current month actuals are partial until the month closes. Chart equivalent table below.
            </p>
            <div className="overflow-x-auto rounded border border-gray-200 bg-white">
              <table className="min-w-full text-sm">
                <caption className="sr-only">Monthly actual and forecast amounts for the fiscal year</caption>
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left">
                      Month
                    </th>
                    <th scope="col" className="px-3 py-2 text-right">
                      Actual
                    </th>
                    <th scope="col" className="px-3 py-2 text-right">
                      Forecast
                    </th>
                    <th scope="col" className="px-3 py-2 text-left">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.monthlyChart.map(
                    (row: {
                      year: number;
                      month: number;
                      label: string;
                      actual: number | null;
                      forecast: number;
                      isElapsed: boolean;
                      isCurrentPartial: boolean;
                    }) => (
                      <tr key={`${row.year}-${row.month}`} className={row.isElapsed ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-2">{row.label}</td>
                        <td className="px-3 py-2 text-right font-medium">{formatCadAmount(row.actual)}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{formatCadAmount(row.forecast)}</td>
                        <td className="px-3 py-2 text-xs text-gray-600">{monthStatusLabel(row)}</td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section aria-labelledby="top-products-heading">
              <h2 id="top-products-heading" className="text-lg font-semibold mb-2">
                Top 5 products by spend
              </h2>
              <table className="min-w-full text-sm border border-gray-200 bg-white rounded">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left">
                      Project identifier
                    </th>
                    <th scope="col" className="px-3 py-2 text-left">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-2 text-right">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.map(
                    (row: { licencePlate: string; name: string; amountCad: number; provider: string }) => (
                      <tr key={row.licencePlate}>
                        <td className="px-3 py-2 font-mono text-xs">{row.licencePlate}</td>
                        <td className="px-3 py-2">
                          {row.name}{' '}
                          <span className="text-xs text-gray-500">({formatForecastProviderLabel(row.provider)})</span>
                        </td>
                        <td className="px-3 py-2 text-right">{formatCadAmount(row.amountCad)}</td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </section>

            <section aria-labelledby="top-services-heading">
              <h2 id="top-services-heading" className="text-lg font-semibold mb-2">
                Top 5 service lines by spend
              </h2>
              <table className="min-w-full text-sm border border-gray-200 bg-white rounded">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left">
                      Service line
                    </th>
                    <th scope="col" className="px-3 py-2 text-right">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.topServiceLines.map((row: { serviceLine: string; amountCad: number }) => (
                    <tr key={row.serviceLine}>
                      <td className="px-3 py-2">{row.serviceLine}</td>
                      <td className="px-3 py-2 text-right">{formatCadAmount(row.amountCad)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>

          <section aria-labelledby="counts-heading" className="flex flex-wrap gap-4 text-sm">
            <h2 id="counts-heading" className="sr-only">
              Related counts
            </h2>
            <Link className="underline text-bcblue" href="/public-cloud/finance/anomalies">
              Anomalies awaiting review: {data.counts.anomaliesAwaitingReview}
            </Link>
            <Link className="underline text-bcblue" href="/public-cloud/finance/coverage">
              Products missing a forecast: {data.counts.productsMissingForecast}
            </Link>
            <Link className="underline text-bcblue" href="/public-cloud/finance/unmatched">
              Unmatched billing lines this month: {data.counts.unmatchedThisMonth}
            </Link>
          </section>

          <output className="block text-xs text-gray-500">
            Data freshness:{' '}
            {data.freshness
              .map(
                (f: { provider: string; completedAt: string | null }) =>
                  `${formatForecastProviderLabel(f.provider)}: ${
                    f.completedAt ? new Date(f.completedAt).toLocaleString('en-CA') : 'never'
                  }`,
              )
              .join(' · ')}
          </output>
        </div>
      )}
    </div>
  );
});
