'use client';

import { Button, SegmentedControl, Select, TextInput } from '@mantine/core';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';
import ExportButton from '@/components/buttons/ExportButton';
import LoadingBox from '@/components/generic/LoadingBox';
import {
  calculateVariance,
  formatCadAmount,
  isCurrentCalendarMonth,
} from '@/components/public-cloud/finance/finance-measure-utils';
import FinanceQueryError from '@/components/public-cloud/finance/FinanceQueryError';
import {
  aggregateMonthlyActualsFromProducts,
  aggregateMonthlyTotalsFromProducts,
  FISCAL_FORECAST_HORIZON_MONTHS,
  fiscalYearChunkHasOptionalMonths,
  formatForecastAmount,
  formatForecastProviderLabel,
  getFiscalYearChunks,
  getFiscalYearTotalSummary,
  getProviderSpendLabel,
  isBeyondRequiredHorizon,
  isForecastHorizonComplete,
  isPastMonth,
  monthKey,
  shortMonthLabel,
  sumMonthlyValues,
  yearRangeLabel,
  type FiscalYearChunk,
  type MonthlyValue,
} from '@/components/public-cloud/forecast/forecast-grid-utils';
import { GlobalPermissions } from '@/constants';
import createClientPage from '@/core/client-page';
import { Provider } from '@/prisma/client';
import { downloadPlatformForecastExport, getPlatformForecast } from '@/services/backend/public-cloud/forecast';
import type { PlatformForecastProduct, PlatformForecastSummary } from '@/services/db/public-cloud-forecast';

const DEFAULT_PRODUCT_LIMIT = 10;
const PRODUCT_LIMIT_INCREMENT = 10;

type ProductSort = 'forecast-desc' | 'name-asc';
type ProductListFilter = 'all' | 'with-forecast' | 'missing-forecast' | 'incomplete-required';
type ProviderFilter = 'ALL' | 'AWS_LZA' | 'AZURE' | 'AWS';

const PROVIDER_FILTER_OPTIONS: { value: Exclude<ProviderFilter, 'ALL'>; label: string }[] = [
  { value: Provider.AWS_LZA, label: 'AWS LZA' },
  { value: Provider.AZURE, label: 'Azure' },
  { value: Provider.AWS, label: 'AWS' },
];

function providerFilterLabel(provider: string) {
  return formatForecastProviderLabel(provider);
}

function formatVarianceCell(variance: { amount: number; percent: number | null } | null) {
  if (variance == null) return '—';
  const percentSuffix = variance.percent == null ? '' : ` (${variance.percent.toFixed(0)}%)`;
  return `${formatCadAmount(variance.amount)}${percentSuffix}`;
}

function SummaryCard({ label, value, hint }: Readonly<{ label: string; value: string; hint?: string }>) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 bg-white">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </div>
  );
}

function productChunkForecasts(product: PlatformForecastProduct, fyChunk: FiscalYearChunk) {
  return fyChunk.months.map((_, i) =>
    product.hasForecast ? product.monthlyTotals[fyChunk.startIndex + i]?.amount ?? 0 : null,
  );
}

function productChunkActuals(product: PlatformForecastProduct, fyChunk: FiscalYearChunk) {
  return fyChunk.months.map((_, i) => product.monthlyActuals[fyChunk.startIndex + i] ?? null);
}

function formatProductMonthAmount(amount: number | null, hasAnyForecast: boolean, currency: string) {
  if (amount == null || !hasAnyForecast || amount <= 0) return '—';
  // Past months can still show previously entered forecast values (read-only).
  return formatForecastAmount(amount, currency);
}

function sumProductRequiredMonthsInChunk(forecasts: (number | null)[], fyChunk: FiscalYearChunk) {
  return fyChunk.months.reduce((sum, month, i) => {
    if (isBeyondRequiredHorizon(month.year, month.month)) return sum;
    return sum + (forecasts[i] ?? 0);
  }, 0);
}

function formatProductYearTotal(
  hasAnyForecast: boolean,
  requiredOnly: boolean,
  forecasts: (number | null)[],
  fyChunk: FiscalYearChunk,
  productYearTotal: number,
  currency: string,
) {
  if (!hasAnyForecast) return '—';
  const total = requiredOnly ? sumProductRequiredMonthsInChunk(forecasts, fyChunk) : productYearTotal;
  return formatForecastAmount(total, currency);
}

/**
 * True when some, but not all, products with a forecast have a value for this month.
 * Past months are never "partial" — blank past is expected for products created later.
 */
function isMonthCoveragePartial(
  products: PlatformForecastProduct[],
  month: { year: number; month: number },
  monthIndex: number,
) {
  if (isPastMonth(month.year, month.month)) return false;

  const withForecast = products.filter((product) => product.hasForecast);
  if (withForecast.length <= 1) return false;

  let withValue = 0;
  for (const product of withForecast) {
    if ((product.monthlyTotals[monthIndex]?.amount ?? 0) > 0) withValue += 1;
  }

  return withValue > 0 && withValue < withForecast.length;
}

/** Has a forecast but is missing at least one required 24-month horizon value. */
function productHasIncompleteRequiredMonths(product: PlatformForecastProduct) {
  return product.hasForecast && !isForecastHorizonComplete(product.monthlyTotals);
}

function matchesProductListFilter(product: PlatformForecastProduct, filter: ProductListFilter) {
  if (filter === 'all') return true;
  if (filter === 'missing-forecast') return !product.hasForecast;
  if (filter === 'incomplete-required') return productHasIncompleteRequiredMonths(product);
  return product.hasForecast;
}

function matchesProductSearch(product: PlatformForecastProduct, search: string) {
  const term = search.trim().toLowerCase();
  if (!term) return true;
  return product.name.toLowerCase().includes(term) || product.licencePlate.toLowerCase().includes(term);
}

function sortProducts(products: PlatformForecastProduct[], sort: ProductSort) {
  return [...products].sort((a, b) => {
    if (sort === 'name-asc') {
      return a.name.localeCompare(b.name) || a.licencePlate.localeCompare(b.licencePlate);
    }

    return b.forecastTotal - a.forecastTotal || a.name.localeCompare(b.name);
  });
}

function formatResidualAmount(amount: number, currency: string) {
  return Math.abs(amount) < 0.005 ? '—' : formatForecastAmount(amount, currency);
}

function PlatformForecastGrid({
  group,
  showActualVariance,
}: Readonly<{ group: PlatformForecastSummary['groups'][number]; showActualVariance: boolean }>) {
  const availableProviders = PROVIDER_FILTER_OPTIONS.filter((option) => group.providers.includes(option.value)).map(
    (option) => option.value,
  );
  const [showProducts, setShowProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productSort, setProductSort] = useState<ProductSort>('forecast-desc');
  const [productListFilter, setProductListFilter] = useState<ProductListFilter>('all');
  const [productLimit, setProductLimit] = useState(DEFAULT_PRODUCT_LIMIT);
  const [providerFilter, setProviderFilter] = useState<ProviderFilter>('ALL');

  let activeProviders = availableProviders;
  if (providerFilter !== 'ALL') {
    activeProviders = availableProviders.includes(providerFilter) ? [providerFilter] : availableProviders;
  }
  const providerFilteredProducts = group.products.filter((product) =>
    activeProviders.includes(product.provider as Exclude<ProviderFilter, 'ALL'>),
  );
  const useFullGroupTotals = providerFilter === 'ALL' || activeProviders.length === availableProviders.length;
  const monthlyTotals = useFullGroupTotals
    ? (group.monthlyTotals as MonthlyValue[])
    : aggregateMonthlyTotalsFromProducts(providerFilteredProducts, group.currency, true);
  const monthlyActuals = useFullGroupTotals
    ? group.monthlyActuals
    : aggregateMonthlyActualsFromProducts(providerFilteredProducts, monthlyTotals.length);

  const values = monthlyTotals;
  const actuals = monthlyActuals;
  const fiscalYearChunks = getFiscalYearChunks(values);
  const spendLabel = activeProviders.length === 1 ? getProviderSpendLabel(activeProviders[0]) : 'Cloud Spend';
  const filteredProductCount = providerFilteredProducts.length;
  const filteredForecastCount = providerFilteredProducts.filter((product) => product.hasForecast).length;
  const incompleteRequiredCount = providerFilteredProducts.filter(productHasIncompleteRequiredMonths).length;
  const lineItemProducts = providerFilteredProducts.filter((product) =>
    matchesProductListFilter(product, productListFilter),
  );
  const searchedProducts = sortProducts(
    lineItemProducts.filter((product) => matchesProductSearch(product, productSearch)),
    productSort,
  );
  const visibleProducts = searchedProducts.slice(0, productLimit);
  // Other-row residuals only make sense when the list is the forecast universe, not a chase filter.
  const otherRowEnabled = productListFilter === 'all' || productListFilter === 'with-forecast';
  const otherBasisProducts =
    productListFilter === 'with-forecast'
      ? providerFilteredProducts.filter((product) => product.hasForecast)
      : providerFilteredProducts;
  const otherProductCount = otherRowEnabled ? Math.max(otherBasisProducts.length - visibleProducts.length, 0) : 0;
  const hiddenMatchingProductCount = Math.max(searchedProducts.length - visibleProducts.length, 0);
  const canShowMoreProducts = hiddenMatchingProductCount > 0;
  const showOtherRow = showProducts && otherRowEnabled && otherProductCount > 0;
  const providerControlData = [
    { value: 'ALL', label: 'All providers' },
    ...PROVIDER_FILTER_OPTIONS.filter((option) => availableProviders.includes(option.value)),
  ];

  useEffect(() => {
    setProductLimit(DEFAULT_PRODUCT_LIMIT);
  }, [productSearch, productSort, productListFilter, providerFilter]);

  useEffect(() => {
    if (providerFilter !== 'ALL' && !availableProviders.includes(providerFilter)) {
      setProviderFilter('ALL');
    }
  }, [availableProviders, providerFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-3 min-w-0 flex-1">
          <div>
            <h2 className="text-lg font-semibold">
              {spendLabel} ({group.currency})
            </h2>
            <p className="text-sm text-gray-600">
              {filteredForecastCount} of {filteredProductCount} {activeProviders.map(providerFilterLabel).join(' / ')}{' '}
              products have a forecast included in these totals.
            </p>
          </div>
          {availableProviders.length > 1 && (
            <SegmentedControl
              value={providerFilter}
              onChange={(value) => setProviderFilter(value as ProviderFilter)}
              data={providerControlData}
            />
          )}
        </div>
        <Button
          variant="light"
          color="gray"
          size="compact-sm"
          leftSection={showProducts ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
          onClick={() => setShowProducts((value) => !value)}
        >
          {showProducts ? 'Hide products' : `Show products (${filteredProductCount})`}
        </Button>
      </div>

      {showProducts && (
        <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-3">
          <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_200px_minmax(220px,1fr)] lg:items-end">
            <TextInput
              label="Find product"
              placeholder="Search name or licence plate"
              value={productSearch}
              onChange={(event) => setProductSearch(event.currentTarget.value)}
            />
            <Select
              label="Sort products"
              value={productSort}
              onChange={(value) => setProductSort((value as ProductSort) ?? 'forecast-desc')}
              data={[
                { value: 'forecast-desc', label: 'Largest forecast total' },
                { value: 'name-asc', label: 'Name A-Z' },
              ]}
              allowDeselect={false}
            />
            <Select
              label="Show products"
              value={productListFilter}
              onChange={(value) => setProductListFilter((value as ProductListFilter) ?? 'all')}
              data={[
                { value: 'all', label: `All (${filteredProductCount})` },
                { value: 'with-forecast', label: `With forecast (${filteredForecastCount})` },
                {
                  value: 'incomplete-required',
                  label: `Incomplete required months (${incompleteRequiredCount})`,
                },
                {
                  value: 'missing-forecast',
                  label: `Missing forecast (${filteredProductCount - filteredForecastCount})`,
                },
              ]}
              allowDeselect={false}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-gray-600">
              Showing {visibleProducts.length} of {searchedProducts.length} matching products
              {otherProductCount > 0
                ? `; Other (${otherProductCount}) includes non-visible products so the rows still sum to totals.`
                : '.'}{' '}
              Export includes all products.
            </p>
            <div className="flex flex-wrap gap-2">
              {canShowMoreProducts && (
                <Button
                  variant="light"
                  color="gray"
                  size="compact-xs"
                  onClick={() =>
                    setProductLimit((limit) => Math.min(limit + PRODUCT_LIMIT_INCREMENT, searchedProducts.length))
                  }
                >
                  Show 10 more
                </Button>
              )}
              {canShowMoreProducts && (
                <Button
                  variant="light"
                  color="gray"
                  size="compact-xs"
                  onClick={() => setProductLimit(searchedProducts.length)}
                >
                  Show all
                </Button>
              )}
              {visibleProducts.length > DEFAULT_PRODUCT_LIMIT && (
                <Button
                  variant="subtle"
                  color="gray"
                  size="compact-xs"
                  onClick={() => setProductLimit(DEFAULT_PRODUCT_LIMIT)}
                >
                  Show first 10
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {fiscalYearChunks.map((fyChunk) => {
          const yearTotal = sumMonthlyValues(fyChunk.months);
          const fySummary = getFiscalYearTotalSummary(fyChunk);
          const hasOptional = fiscalYearChunkHasOptionalMonths(fyChunk);

          return (
            <div key={fyChunk.label} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700">
                {fyChunk.label} <span className="font-normal text-gray-500">({yearRangeLabel(fyChunk.months)})</span>
                {hasOptional && (
                  <span className="ml-2 font-normal text-xs text-gray-500">
                    months beyond the required {FISCAL_FORECAST_HORIZON_MONTHS}-month window are optional
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-3 py-2 text-left text-gray-500 min-w-48 sticky left-0 bg-white">
                        {spendLabel}
                      </th>
                      {fyChunk.months.map((v, i) => {
                        const optional = isBeyondRequiredHorizon(v.year, v.month);
                        const coveragePartial = isMonthCoveragePartial(
                          providerFilteredProducts,
                          v,
                          fyChunk.startIndex + i,
                        );
                        return (
                          <th
                            key={monthKey(v.year, v.month)}
                            className={`px-2 py-2 text-center font-medium ${
                              optional || coveragePartial ? 'text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            {shortMonthLabel(v.year, v.month)}
                            {optional && <div className="text-[10px] font-normal normal-case">optional</div>}
                            {coveragePartial && <div className="text-[10px] font-normal normal-case">partial</div>}
                          </th>
                        );
                      })}
                      <th className="px-3 py-2 text-center font-semibold bg-amber-50 text-gray-800">
                        TOTAL
                        {fySummary.isPartial && (
                          <div className="text-[10px] font-normal normal-case text-gray-500">partial</div>
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {showProducts && (
                      <tr className="border-b border-gray-100 bg-gray-50/80">
                        <td
                          colSpan={fyChunk.months.length + 2}
                          className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 sticky left-0"
                        >
                          Forecast by product
                        </td>
                      </tr>
                    )}
                    {showProducts &&
                      visibleProducts.map((product) => {
                        const forecasts = productChunkForecasts(product, fyChunk);
                        const productActuals = productChunkActuals(product, fyChunk);
                        const productYearTotal = forecasts.reduce<number>((sum, v) => sum + (v ?? 0), 0);
                        const productActualYearTotal = productActuals.reduce<number>((sum, v) => sum + (v ?? 0), 0);
                        const hasAnyForecast = forecasts.some((v) => v != null && v !== 0) || product.hasForecast;
                        return (
                          <Fragment key={product.licencePlate}>
                            <tr className="border-b border-gray-100">
                              <td className="px-3 py-2 sticky left-0 bg-white border-r border-gray-100">
                                <Link
                                  href={`/public-cloud/products/${product.licencePlate}/edit`}
                                  className="block hover:underline"
                                >
                                  <div className="pl-3 text-gray-800">
                                    {product.name}
                                    {product.status === 'INACTIVE' ? (
                                      <span className="ml-2 text-xs font-normal text-gray-500">(archived)</span>
                                    ) : null}
                                  </div>
                                  <div className="pl-3 text-xs text-gray-400">{product.licencePlate}</div>
                                </Link>
                              </td>
                              {fyChunk.months.map((v, i) => {
                                const past = isPastMonth(v.year, v.month);
                                const cellClass = past ? 'bg-gray-50 text-gray-400' : 'text-gray-700';
                                return (
                                  <td key={monthKey(v.year, v.month)} className={`px-2 py-2 text-center ${cellClass}`}>
                                    {formatProductMonthAmount(forecasts[i], hasAnyForecast, group.currency)}
                                  </td>
                                );
                              })}
                              <td className="px-3 py-2 text-center bg-amber-50/60 text-gray-800">
                                {formatProductYearTotal(
                                  hasAnyForecast,
                                  fySummary.requiredOnly,
                                  forecasts,
                                  fyChunk,
                                  productYearTotal,
                                  group.currency,
                                )}
                              </td>
                            </tr>
                            {showActualVariance && (
                              <>
                                <tr className="border-b border-gray-100 bg-gray-50/40">
                                  <td className="px-3 py-2 sticky left-0 bg-gray-50/40 border-r border-gray-100">
                                    <div className="pl-3 text-xs text-gray-500">Actual</div>
                                  </td>
                                  {fyChunk.months.map((v, i) => {
                                    const amount = productActuals[i];
                                    const partial = isCurrentCalendarMonth(v.year, v.month);
                                    return (
                                      <td
                                        key={`actual-${product.licencePlate}-${monthKey(v.year, v.month)}`}
                                        className="px-2 py-2 text-center text-sm text-gray-700"
                                      >
                                        {amount == null ? '—' : formatCadAmount(amount)}
                                        {partial && amount != null && (
                                          <div className="text-[10px] text-gray-500">partial</div>
                                        )}
                                      </td>
                                    );
                                  })}
                                  <td className="px-3 py-2 text-center bg-amber-50/60 text-gray-800">
                                    {productActuals.some((v) => v != null)
                                      ? formatCadAmount(productActualYearTotal)
                                      : '—'}
                                  </td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                  <td className="px-3 py-2 sticky left-0 bg-white border-r border-gray-100">
                                    <div className="pl-3 text-xs text-gray-500">Variance</div>
                                  </td>
                                  {fyChunk.months.map((v, i) => {
                                    const variance = calculateVariance(productActuals[i], forecasts[i]);
                                    return (
                                      <td
                                        key={`var-${product.licencePlate}-${monthKey(v.year, v.month)}`}
                                        className="px-2 py-2 text-center text-sm text-gray-700"
                                      >
                                        {formatVarianceCell(variance)}
                                      </td>
                                    );
                                  })}
                                  <td className="px-3 py-2 text-center bg-amber-50/60 text-gray-800">
                                    {formatVarianceCell(calculateVariance(productActualYearTotal, productYearTotal))}
                                  </td>
                                </tr>
                              </>
                            )}
                          </Fragment>
                        );
                      })}
                    {showOtherRow && (
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <td className="px-3 py-2 sticky left-0 bg-gray-50 border-r border-gray-100">
                          <div className="pl-3 text-gray-700 font-medium">Other ({otherProductCount} products)</div>
                        </td>
                        {fyChunk.months.map((month, i) => {
                          const visibleTotal = visibleProducts.reduce((sum, product) => {
                            if (!product.hasForecast) return sum;
                            return sum + (product.monthlyTotals[fyChunk.startIndex + i]?.amount ?? 0);
                          }, 0);
                          const residual = month.amount - visibleTotal;
                          return (
                            <td key={monthKey(month.year, month.month)} className="px-2 py-2 text-center text-gray-700">
                              {formatResidualAmount(residual, group.currency)}
                            </td>
                          );
                        })}
                        <td className="px-3 py-2 text-center bg-amber-50/60 text-gray-800">
                          {formatResidualAmount(
                            yearTotal -
                              visibleProducts.reduce((sum, product) => {
                                if (!product.hasForecast) return sum;
                                return (
                                  sum +
                                  fyChunk.months.reduce(
                                    (monthSum, _, i) =>
                                      monthSum + (product.monthlyTotals[fyChunk.startIndex + i]?.amount ?? 0),
                                    0,
                                  )
                                );
                              }, 0),
                            group.currency,
                          )}
                        </td>
                      </tr>
                    )}
                    <tr className={showProducts ? 'bg-amber-50/40 font-semibold' : ''}>
                      <td className="px-3 py-2 text-gray-700 sticky left-0 bg-inherit border-r border-gray-100">
                        {showProducts ? 'Forecast total' : 'Forecast'}
                      </td>
                      {fyChunk.months.map((v) => {
                        const past = isPastMonth(v.year, v.month);
                        const cellClass = past ? 'bg-gray-100 text-gray-400' : 'bg-inherit text-gray-900';
                        return (
                          <td key={monthKey(v.year, v.month)} className={`px-2 py-2 text-center ${cellClass}`}>
                            {v.amount <= 0 ? '—' : formatForecastAmount(v.amount, group.currency)}
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 text-center font-bold bg-amber-50 text-gray-900">
                        {formatForecastAmount(fySummary.total, group.currency)}
                      </td>
                    </tr>
                    {showActualVariance && (
                      <>
                        <tr className={showProducts ? 'bg-amber-50/20 font-semibold' : ''}>
                          <td className="px-3 py-2 text-gray-700 sticky left-0 bg-inherit border-r border-gray-100">
                            {showProducts ? 'Actual total' : 'Actual'}
                          </td>
                          {fyChunk.months.map((v, i) => {
                            const amount = actuals[fyChunk.startIndex + i];
                            const partial = isCurrentCalendarMonth(v.year, v.month);
                            return (
                              <td
                                key={`actual-total-${monthKey(v.year, v.month)}`}
                                className="px-2 py-2 text-center text-gray-900"
                              >
                                {amount == null ? '—' : formatCadAmount(amount)}
                                {partial && amount != null && (
                                  <div className="text-[10px] font-normal text-gray-500">partial</div>
                                )}
                              </td>
                            );
                          })}
                          <td className="px-3 py-2 text-center font-bold bg-amber-50 text-gray-900">
                            {fyChunk.months.some((_, i) => actuals[fyChunk.startIndex + i] != null)
                              ? formatCadAmount(
                                  fyChunk.months.reduce((sum, _, i) => sum + (actuals[fyChunk.startIndex + i] ?? 0), 0),
                                )
                              : '—'}
                          </td>
                        </tr>
                        <tr className={showProducts ? 'bg-amber-50/20 font-semibold' : ''}>
                          <td className="px-3 py-2 text-gray-700 sticky left-0 bg-inherit border-r border-gray-100">
                            {showProducts ? 'Variance total' : 'Variance'}
                          </td>
                          {fyChunk.months.map((v, i) => {
                            const variance = calculateVariance(actuals[fyChunk.startIndex + i], v.amount);
                            return (
                              <td
                                key={`var-total-${monthKey(v.year, v.month)}`}
                                className="px-2 py-2 text-center text-gray-900"
                              >
                                {formatVarianceCell(variance)}
                              </td>
                            );
                          })}
                          <td className="px-3 py-2 text-center font-bold bg-amber-50 text-gray-900">
                            {formatVarianceCell(
                              calculateVariance(
                                fyChunk.months.reduce((sum, _, i) => sum + (actuals[fyChunk.startIndex + i] ?? 0), 0),
                                fySummary.total,
                              ),
                            )}
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const publicCloudForecastPage = createClientPage({
  permissions: [GlobalPermissions.ViewPublicCloudForecast],
  fallbackUrl: '/login?callbackUrl=/home',
});

export default publicCloudForecastPage(({ session }) => {
  const showActualVariance = Boolean(session?.previews.publicCloudFinance);
  const { data, isLoading, isError, error, refetch } = useQuery<PlatformForecastSummary>({
    queryKey: ['forecast-platform-forecast'],
    queryFn: () => getPlatformForecast(),
    enabled: Boolean(session?.previews.publicCloudForecast),
  });

  if (!session?.previews.publicCloudForecast) return null;

  const coverage =
    data && data.totalProducts > 0 ? Math.round((data.productsWithForecast / data.totalProducts) * 100) : 0;

  const handleExport = () => downloadPlatformForecastExport();

  return (
    <LoadingBox isLoading={isLoading}>
      <div className="space-y-6 p-4">
        <div className="flex flex-wrap items-start gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold">Public Cloud Forecast</h1>
            <p className="text-sm text-gray-600 mt-1">
              {showActualVariance
                ? 'Read-only rollup of forecast, actuals, and variance for all public cloud products (including archived). Amounts are CAD.'
                : 'Read-only rollup of forecasts for all public cloud products, including archived ones so historical totals stay complete. All forecasts are in CAD.'}
            </p>
          </div>
          <ExportButton className="ml-auto shrink-0" onExport={handleExport} />
        </div>

        {!isError && (
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard label="Products" value={String(data?.totalProducts ?? 0)} />
            <SummaryCard label="With forecast" value={String(data?.productsWithForecast ?? 0)} />
            <SummaryCard
              label="Forecast coverage"
              value={`${coverage}%`}
              hint="Products missing a forecast are not included in the forecast totals below."
            />
          </div>
        )}

        {isError ? (
          <FinanceQueryError error={error} onRetry={() => refetch()} title="Could not load forecast rollup" />
        ) : data?.groups.length ? (
          <div className="space-y-10">
            {data.groups.map((group) => (
              <PlatformForecastGrid key={group.currency} group={group} showActualVariance={showActualVariance} />
            ))}
          </div>
        ) : (
          !isLoading && <p className="text-sm text-gray-600">No public cloud products found.</p>
        )}
      </div>
    </LoadingBox>
  );
});
