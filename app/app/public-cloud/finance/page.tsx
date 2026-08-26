'use client';

import { Button, SegmentedControl } from '@mantine/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import LoadingBox from '@/components/generic/LoadingBox';
import { failure, success } from '@/components/notification';
import {
  calculateVariance,
  failedIngestProviders,
  formatCadAmount,
  formatIngestionFreshnessLine,
  formatPercent,
  ytdActualHint,
} from '@/components/public-cloud/finance/finance-measure-utils';
import FinanceNav from '@/components/public-cloud/finance/FinanceNav';
import FinanceQueryError from '@/components/public-cloud/finance/FinanceQueryError';
import { formatForecastProviderLabel } from '@/components/public-cloud/forecast/forecast-grid-utils';
import { GlobalPermissions } from '@/constants';
import createClientPage from '@/core/client-page';
import { Provider } from '@/prisma/client';
import {
  getFinanceIngestPlan,
  getFinanceSnapshot,
  triggerFinanceIngest,
} from '@/services/backend/public-cloud/finance';

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

function formatVarianceCell(actual: number | null, forecast: number) {
  const variance = calculateVariance(actual, forecast);
  if (variance == null) return '—';
  return `${formatCadAmount(variance.amount)} (${formatPercent(variance.percent, 0)})`;
}

type IngestJob = { provider: string; year: number; month: number };

function formatIngestJob(job: IngestJob) {
  return `${formatForecastProviderLabel(job.provider)} ${job.year}-${String(job.month).padStart(2, '0')}`;
}

function ingestErrorMessage(error: unknown) {
  const data = (error as { response?: { data?: { message?: string; error?: unknown } } })?.response?.data;
  if (typeof data?.error === 'string' && data.error.trim()) return data.error;
  if (data?.message && data.message !== 'Internal Server Error') return data.message;
  if (error instanceof Error && error.message) return error.message;
  return 'Ingest failed. Check freshness for the last error.';
}

const publicCloudFinancePage = createClientPage({
  permissions: [GlobalPermissions.ViewPublicCloudForecast],
});

export default publicCloudFinancePage(({ session }) => {
  const [provider, setProvider] = useState<ProviderFilter>('ALL');
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['finance-snapshot', provider],
    queryFn: () => getFinanceSnapshot(provider),
    enabled: Boolean(session?.previews.publicCloudFinance),
  });
  const [ingestProgress, setIngestProgress] = useState<{ job: IngestJob; current: number; total: number } | null>(null);
  const ingestMutation = useMutation({
    mutationFn: async () => {
      const plan = await getFinanceIngestPlan();
      const jobs: IngestJob[] = plan.providers.flatMap(
        (item: { provider: string; periods: Array<{ year: number; month: number }> }) =>
          item.periods.map((period) => ({
            provider: item.provider,
            year: period.year,
            month: period.month,
          })),
      );
      if (jobs.length === 0) return jobs;
      const results = [];
      for (const [index, job] of jobs.entries()) {
        setIngestProgress({ job, current: index + 1, total: jobs.length });
        results.push(await triggerFinanceIngest(job));
      }
      return jobs;
    },
    onSuccess: async (jobs) => {
      setIngestProgress(null);
      success({
        message: jobs.length === 0 ? 'Nothing to ingest.' : `Ingest finished: ${jobs.map(formatIngestJob).join(', ')}.`,
      });
      await queryClient.invalidateQueries({ queryKey: ['finance-snapshot'] });
    },
    onError: async (error) => {
      setIngestProgress(null);
      failure({ message: ingestErrorMessage(error) });
      await queryClient.invalidateQueries({ queryKey: ['finance-snapshot'] });
    },
  });

  if (!session?.previews.publicCloudFinance) return null;

  const failedProviders = data ? failedIngestProviders(data.freshness) : [];

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

      {isError ? (
        <FinanceQueryError error={error} onRetry={() => refetch()} title="Could not load finance snapshot" />
      ) : isLoading || !data ? (
        <LoadingBox isLoading>
          <div className="min-h-24" />
        </LoadingBox>
      ) : (
        <div className="space-y-6">
          {failedProviders.length > 0 && (
            <output className="block rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-950">
              {failedProviders.map((name) => formatForecastProviderLabel(name)).join(', ')} ingest failed for the last
              run. FYTD may be incomplete.
            </output>
          )}
          {data.lowCoverage && (
            <output className="block rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              Forecast coverage is {formatPercent(data.coverage.percent, 1)} ({data.coverage.completeCount} of{' '}
              {data.coverage.productCount} products). Variance is not meaningful at this coverage — showing actuals-only
              reporting for the estate this page describes.
            </output>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <SummaryCard
              label={`FYTD actual (${data.fiscalYearLabel})`}
              value={formatCadAmount(data.fytdActual)}
              hint={ytdActualHint(data.actualsCoverage, data.lastCompleteMonth)}
            />
            <SummaryCard
              label="FYTD forecast"
              value={formatCadAmount(data.fytdForecast)}
              hint={
                data.coverage.excludedFromForecastTotals > 0
                  ? `Same months as FYTD actual · excludes ${data.coverage.excludedFromForecastTotals} products with no forecast`
                  : 'Same months as FYTD actual'
              }
            />
            <SummaryCard
              label="FYTD variance"
              value={
                data.lowCoverage || !data.fytdVariance
                  ? '—'
                  : `${formatCadAmount(data.fytdVariance.amount)} (${formatPercent(data.fytdVariance.percent, 1)})`
              }
              hint={
                data.lowCoverage
                  ? 'No data — coverage too low'
                  : `Actual − forecast through ${data.lastCompleteMonth.year}-${String(
                      data.lastCompleteMonth.month,
                    ).padStart(2, '0')}`
              }
            />
            <SummaryCard
              label="Full-year forecast"
              value={formatCadAmount(data.fullYearForecast)}
              hint="Planning total for the fiscal year (not used in FYTD variance)"
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
                <caption className="sr-only">Monthly actual, forecast, and variance for the fiscal year</caption>
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
                    <th scope="col" className="px-3 py-2 text-right">
                      Variance
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
                        <td className="px-3 py-2 text-right text-gray-700">
                          {formatVarianceCell(row.actual, row.forecast)}
                        </td>
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
                    (row: {
                      licencePlate: string;
                      name: string;
                      amountCad: number;
                      provider: string;
                      status?: string;
                    }) => (
                      <tr key={row.licencePlate}>
                        <td className="px-3 py-2 font-mono text-xs">{row.licencePlate}</td>
                        <td className="px-3 py-2">
                          {row.name}
                          {row.status === 'INACTIVE' ? (
                            <span className="ml-1 text-xs text-gray-500">(archived)</span>
                          ) : null}{' '}
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

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <output className="block text-xs text-gray-500">
                Data freshness:{' '}
                {data.freshness
                  .map((f) => `${formatForecastProviderLabel(f.provider)}: ${formatIngestionFreshnessLine(f)}`)
                  .join(' · ')}
              </output>
              <Button
                type="button"
                size="xs"
                variant="light"
                loading={ingestMutation.isPending}
                disabled={ingestMutation.isPending}
                onClick={() => ingestMutation.mutate()}
              >
                {ingestProgress
                  ? `Ingesting ${formatIngestJob(ingestProgress.job)} (${ingestProgress.current} of ${
                      ingestProgress.total
                    })`
                  : ingestMutation.isPending
                    ? 'Preparing ingest…'
                    : 'Ingest missing months'}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              {ingestProgress
                ? `Re-runs the last complete month and any earlier fiscal-year month with no successful ingest. Can take several minutes. Now ${formatIngestJob(
                    ingestProgress.job,
                  )}.`
                : 'Re-runs the last complete month and any earlier fiscal-year month with no successful ingest. Can take several minutes.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
});
