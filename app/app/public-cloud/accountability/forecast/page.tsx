'use client';

import { Button, Checkbox, SegmentedControl, Select, TextInput } from '@mantine/core';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ExportButton from '@/components/buttons/ExportButton';
import LoadingBox from '@/components/generic/LoadingBox';
import {
  formatForecastAmount,
  getFiscalYearChunks,
  getProviderSpendLabel,
  isPastMonth,
  mergeMonthlyValuesOntoFiscalHorizon,
  monthKey,
  shortMonthLabel,
  sumMonthlyValues,
  yearRangeLabel,
  type FiscalYearChunk,
  type MonthlyValue,
} from '@/components/public-cloud/accountability/forecast-grid-utils';
import { GlobalPermissions } from '@/constants';
import createClientPage from '@/core/client-page';
import { Provider } from '@/prisma/client';
import { downloadPlatformForecastExport, getPlatformForecast } from '@/services/backend/public-cloud/accountability';
import { PlatformForecastProduct, PlatformForecastSummary } from '@/services/db/public-cloud-accountability';

const DEFAULT_PRODUCT_LIMIT = 10;
const PRODUCT_LIMIT_INCREMENT = 10;

type ProductSort = 'forecast-desc' | 'variance-desc' | 'name-asc';
type ProviderFilter = 'ALL' | 'AWS_LZA' | 'AZURE' | 'AWS';

const PROVIDER_FILTER_OPTIONS: { value: Exclude<ProviderFilter, 'ALL'>; label: string }[] = [
  { value: Provider.AWS_LZA, label: 'AWS LZA' },
  { value: Provider.AZURE, label: 'Azure' },
  { value: Provider.AWS, label: 'AWS' },
];

function providerFilterLabel(provider: string) {
  if (provider === Provider.AWS_LZA) return 'AWS LZA';
  if (provider === Provider.AZURE) return 'Azure';
  if (provider === Provider.AWS) return 'AWS';
  return provider;
}

function buildFilteredGroupTotals(
  products: PlatformForecastProduct[],
  currency: string,
): { monthlyTotals: MonthlyValue[]; monthlyActuals: (number | null)[] } {
  const totalsByMonth = new Map<string, MonthlyValue>();
  const actualsByMonth = new Map<string, number>();

  for (const product of products) {
    if (product.hasForecast) {
      for (const value of product.monthlyTotals) {
        const key = monthKey(value.year, value.month);
        const existing = totalsByMonth.get(key);
        if (existing) {
          existing.amount += value.amount;
        } else {
          totalsByMonth.set(key, { ...value, currency });
        }
      }
    }

    product.monthlyTotals.forEach((slot, index) => {
      const actual = product.monthlyActuals[index];
      if (actual == null) return;
      const key = monthKey(slot.year, slot.month);
      actualsByMonth.set(key, (actualsByMonth.get(key) ?? 0) + actual);
    });
  }

  const monthlyTotals = mergeMonthlyValuesOntoFiscalHorizon([...totalsByMonth.values()], currency);
  const monthlyActuals = monthlyTotals.map((slot) => actualsByMonth.get(monthKey(slot.year, slot.month)) ?? null);
  return { monthlyTotals, monthlyActuals };
}

function SummaryCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 bg-white">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </div>
  );
}

function formatVariance(variance: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    signDisplay: 'exceptZero',
  }).format(variance);
}

function varianceClass(variance: number) {
  if (variance > 0) return 'text-red-600';
  if (variance < 0) return 'text-green-600';
  return 'text-gray-600';
}

function productChunkValues(product: PlatformForecastProduct, fyChunk: FiscalYearChunk) {
  const forecasts = fyChunk.months.map((_, i) =>
    product.hasForecast ? product.monthlyTotals[fyChunk.startIndex + i]?.amount ?? 0 : null,
  );
  const actuals = fyChunk.months.map((_, i) => product.monthlyActuals[fyChunk.startIndex + i] ?? null);
  const variances = fyChunk.months.map((_, i) =>
    actuals[i] != null && forecasts[i] != null ? actuals[i]! - forecasts[i]! : null,
  );
  return { forecasts, actuals, variances };
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

    if (sort === 'variance-desc') {
      return Math.abs(b.varianceToDate ?? 0) - Math.abs(a.varianceToDate ?? 0) || a.name.localeCompare(b.name);
    }

    return b.forecastTotal - a.forecastTotal || a.name.localeCompare(b.name);
  });
}

function sumNullable(values: (number | null)[]) {
  return values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
}

function formatResidualAmount(amount: number, currency: string) {
  return Math.abs(amount) < 0.005 ? '—' : formatForecastAmount(amount, currency);
}

function formatResidualVariance(amount: number, currency: string) {
  return Math.abs(amount) < 0.005 ? '—' : formatVariance(amount, currency);
}

function PlatformForecastGrid({ group }: { group: PlatformForecastSummary['groups'][number] }) {
  const availableProviders = PROVIDER_FILTER_OPTIONS.filter((option) => group.providers.includes(option.value)).map(
    (option) => option.value,
  );
  const [showProducts, setShowProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productSort, setProductSort] = useState<ProductSort>('forecast-desc');
  const [missingOnly, setMissingOnly] = useState(false);
  const [productLimit, setProductLimit] = useState(DEFAULT_PRODUCT_LIMIT);
  const [providerFilter, setProviderFilter] = useState<ProviderFilter>('ALL');

  const activeProviders =
    providerFilter === 'ALL'
      ? availableProviders
      : availableProviders.includes(providerFilter)
        ? [providerFilter]
        : availableProviders;
  const providerFilteredProducts = group.products.filter((product) =>
    activeProviders.includes(product.provider as Exclude<ProviderFilter, 'ALL'>),
  );
  const filteredTotals =
    providerFilter === 'ALL' || activeProviders.length === availableProviders.length
      ? { monthlyTotals: group.monthlyTotals as MonthlyValue[], monthlyActuals: group.monthlyActuals }
      : buildFilteredGroupTotals(providerFilteredProducts, group.currency);

  const values = filteredTotals.monthlyTotals;
  const actuals = filteredTotals.monthlyActuals;
  const fiscalYearChunks = getFiscalYearChunks(values);
  const grandTotal = sumMonthlyValues(values);
  const actualToDate = actuals.reduce<number>((sum, v) => sum + (v ?? 0), 0);
  const forecastForActualMonths = values.reduce((sum, v, i) => (actuals[i] != null ? sum + v.amount : sum), 0);
  const hasActuals = actuals.some((v) => v != null);
  const spendLabel = activeProviders.length === 1 ? getProviderSpendLabel(activeProviders[0]) : 'Cloud Spend';
  const filteredProductCount = providerFilteredProducts.length;
  const filteredForecastCount = providerFilteredProducts.filter((product) => product.hasForecast).length;
  const lineItemProducts = providerFilteredProducts.filter((product) =>
    missingOnly ? !product.hasForecast : product.hasForecast || product.monthlyActuals.some((v) => v != null),
  );
  const searchedProducts = sortProducts(
    lineItemProducts.filter((product) => matchesProductSearch(product, productSearch)),
    productSort,
  );
  const visibleProducts = searchedProducts.slice(0, productLimit);
  const otherProductCount = Math.max(providerFilteredProducts.length - visibleProducts.length, 0);
  const hiddenMatchingProductCount = Math.max(searchedProducts.length - visibleProducts.length, 0);
  const canShowMoreProducts = hiddenMatchingProductCount > 0;
  const showOtherRow = showProducts && otherProductCount > 0;
  const includesAws = activeProviders.some((provider) => provider === Provider.AWS || provider === Provider.AWS_LZA);
  const providerControlData = [
    { value: 'ALL', label: 'All providers' },
    ...PROVIDER_FILTER_OPTIONS.filter((option) => availableProviders.includes(option.value)),
  ];

  useEffect(() => {
    setProductLimit(DEFAULT_PRODUCT_LIMIT);
  }, [productSearch, productSort, missingOnly, providerFilter]);

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
              products have an approved forecast included in these totals. Actuals are closed-month spend reported by
              the cloud service provider.
              {includesAws ? ' AWS USD actuals are converted to CAD using the monthly FX rate.' : ''}
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
          <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_220px_auto] lg:items-end">
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
                { value: 'variance-desc', label: 'Largest variance' },
                { value: 'name-asc', label: 'Name A-Z' },
              ]}
              allowDeselect={false}
            />
            <Checkbox
              label="Missing forecast only"
              checked={missingOnly}
              onChange={(event) => setMissingOnly(event.currentTarget.checked)}
              className="pb-2"
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
          const chunkActuals = fyChunk.months.map((_, i) => actuals[fyChunk.startIndex + i] ?? null);
          const chunkHasActuals = chunkActuals.some((v) => v != null);
          const chunkActualTotal = chunkActuals.reduce<number>((sum, v) => sum + (v ?? 0), 0);
          const chunkVarianceTotal = fyChunk.months.reduce(
            (sum, v, i) => (chunkActuals[i] != null ? sum + (chunkActuals[i]! - v.amount) : sum),
            0,
          );

          return (
            <div key={fyChunk.label} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700">
                {fyChunk.label} <span className="font-normal text-gray-500">({yearRangeLabel(fyChunk.months)})</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-3 py-2 text-left text-gray-500 min-w-48 sticky left-0 bg-white">
                        {spendLabel}
                      </th>
                      {fyChunk.months.map((v) => (
                        <th key={monthKey(v.year, v.month)} className="px-2 py-2 text-center text-gray-500 font-medium">
                          {shortMonthLabel(v.year, v.month)}
                        </th>
                      ))}
                      <th className="px-3 py-2 text-center font-semibold bg-amber-50 text-gray-800">TOTAL</th>
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
                        const { forecasts } = productChunkValues(product, fyChunk);
                        const productYearTotal = forecasts.reduce<number>((sum, v) => sum + (v ?? 0), 0);
                        const hasAnyForecast = forecasts.some((v) => v != null && v !== 0) || product.hasForecast;
                        return (
                          <tr key={`forecast-${product.licencePlate}`} className="border-b border-gray-100">
                            <td className="px-3 py-2 sticky left-0 bg-white border-r border-gray-100">
                              <Link
                                href={`/public-cloud/products/${product.licencePlate}/edit`}
                                className="block hover:underline"
                              >
                                <div className="pl-3 text-gray-800">{product.name}</div>
                                <div className="pl-3 text-xs text-gray-400">{product.licencePlate}</div>
                              </Link>
                            </td>
                            {fyChunk.months.map((v, i) => (
                              <td
                                key={monthKey(v.year, v.month)}
                                className={`px-2 py-2 text-center ${
                                  isPastMonth(v.year, v.month) ? 'bg-gray-50 text-gray-500' : 'text-gray-700'
                                }`}
                              >
                                {forecasts[i] != null && hasAnyForecast
                                  ? formatForecastAmount(forecasts[i]!, group.currency)
                                  : '—'}
                              </td>
                            ))}
                            <td className="px-3 py-2 text-center bg-amber-50/60 text-gray-800">
                              {hasAnyForecast ? formatForecastAmount(productYearTotal, group.currency) : '—'}
                            </td>
                          </tr>
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
                    <tr className={`border-b border-gray-100 ${showProducts ? 'bg-amber-50/40 font-semibold' : ''}`}>
                      <td className="px-3 py-2 text-gray-700 sticky left-0 bg-inherit border-r border-gray-100">
                        {showProducts ? 'Forecast total' : 'Forecast'}
                      </td>
                      {fyChunk.months.map((v) => (
                        <td
                          key={monthKey(v.year, v.month)}
                          className={`px-2 py-2 text-center ${
                            isPastMonth(v.year, v.month) ? 'bg-gray-100 text-gray-500' : 'bg-inherit text-gray-900'
                          }`}
                        >
                          {formatForecastAmount(v.amount, group.currency)}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-center font-bold bg-amber-50 text-gray-900">
                        {formatForecastAmount(yearTotal, group.currency)}
                      </td>
                    </tr>

                    {showProducts && (
                      <tr className="border-b border-gray-100 bg-gray-50/80">
                        <td
                          colSpan={fyChunk.months.length + 2}
                          className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 sticky left-0"
                        >
                          Actual by product
                        </td>
                      </tr>
                    )}
                    {showProducts &&
                      visibleProducts.map((product) => {
                        const { actuals: productActuals } = productChunkValues(product, fyChunk);
                        const productHasActuals = productActuals.some((v) => v != null);
                        const productActualTotal = productActuals.reduce<number>((sum, v) => sum + (v ?? 0), 0);
                        return (
                          <tr key={`actual-${product.licencePlate}`} className="border-b border-gray-100">
                            <td className="px-3 py-2 sticky left-0 bg-white border-r border-gray-100">
                              <div className="pl-3 text-gray-800">{product.name}</div>
                              <div className="pl-3 text-xs text-gray-400">{product.licencePlate}</div>
                            </td>
                            {fyChunk.months.map((v, i) => (
                              <td
                                key={monthKey(v.year, v.month)}
                                className={`px-2 py-2 text-center ${
                                  productActuals[i] != null ? 'text-gray-700' : 'text-gray-400'
                                }`}
                              >
                                {productActuals[i] != null
                                  ? formatForecastAmount(productActuals[i]!, group.currency)
                                  : '—'}
                              </td>
                            ))}
                            <td className="px-3 py-2 text-center text-gray-800">
                              {productHasActuals ? formatForecastAmount(productActualTotal, group.currency) : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    {showOtherRow && (
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <td className="px-3 py-2 sticky left-0 bg-gray-50 border-r border-gray-100">
                          <div className="pl-3 text-gray-700 font-medium">Other ({otherProductCount} products)</div>
                        </td>
                        {fyChunk.months.map((month, i) => {
                          const actual = chunkActuals[i];
                          const visibleTotal = visibleProducts.reduce(
                            (sum, product) => sum + (product.monthlyActuals[fyChunk.startIndex + i] ?? 0),
                            0,
                          );
                          const residual = actual != null ? actual - visibleTotal : null;
                          return (
                            <td key={monthKey(month.year, month.month)} className="px-2 py-2 text-center text-gray-700">
                              {residual != null ? formatResidualAmount(residual, group.currency) : '—'}
                            </td>
                          );
                        })}
                        <td className="px-3 py-2 text-center text-gray-800">
                          {chunkHasActuals
                            ? formatResidualAmount(
                                chunkActualTotal -
                                  visibleProducts.reduce(
                                    (sum, product) =>
                                      sum +
                                      fyChunk.months.reduce(
                                        (monthSum, _, i) =>
                                          monthSum + (product.monthlyActuals[fyChunk.startIndex + i] ?? 0),
                                        0,
                                      ),
                                    0,
                                  ),
                                group.currency,
                              )
                            : '—'}
                        </td>
                      </tr>
                    )}
                    <tr className={`border-b border-gray-100 ${showProducts ? 'bg-amber-50/40 font-semibold' : ''}`}>
                      <td className="px-3 py-2 text-gray-700 sticky left-0 bg-inherit border-r border-gray-100">
                        {showProducts ? 'Actual total' : 'Actual'}
                      </td>
                      {fyChunk.months.map((v, i) => (
                        <td
                          key={monthKey(v.year, v.month)}
                          className={`px-2 py-2 text-center ${
                            chunkActuals[i] != null ? 'text-gray-900' : 'text-gray-400'
                          }`}
                        >
                          {chunkActuals[i] != null ? formatForecastAmount(chunkActuals[i]!, group.currency) : '—'}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-center font-semibold text-gray-900">
                        {chunkHasActuals ? formatForecastAmount(chunkActualTotal, group.currency) : '—'}
                      </td>
                    </tr>

                    {showProducts && (
                      <tr className="border-b border-gray-100 bg-gray-50/80">
                        <td
                          colSpan={fyChunk.months.length + 2}
                          className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 sticky left-0"
                        >
                          Variance by product
                        </td>
                      </tr>
                    )}
                    {showProducts &&
                      visibleProducts.map((product) => {
                        const { variances } = productChunkValues(product, fyChunk);
                        const productHasVariance = variances.some((v) => v != null);
                        const productVarianceTotal = variances.reduce<number>((sum, v) => sum + (v ?? 0), 0);
                        return (
                          <tr key={`variance-${product.licencePlate}`} className="border-b border-gray-100">
                            <td className="px-3 py-2 sticky left-0 bg-white border-r border-gray-100">
                              <div className="pl-3 text-gray-800">{product.name}</div>
                              <div className="pl-3 text-xs text-gray-400">{product.licencePlate}</div>
                            </td>
                            {fyChunk.months.map((v, i) => (
                              <td
                                key={monthKey(v.year, v.month)}
                                className={`px-2 py-2 text-center whitespace-nowrap ${
                                  variances[i] != null ? varianceClass(variances[i]!) : 'text-gray-400'
                                }`}
                              >
                                {variances[i] != null ? formatVariance(variances[i]!, group.currency) : '—'}
                              </td>
                            ))}
                            <td
                              className={`px-3 py-2 text-center whitespace-nowrap ${
                                productHasVariance ? varianceClass(productVarianceTotal) : 'text-gray-400'
                              }`}
                            >
                              {productHasVariance ? formatVariance(productVarianceTotal, group.currency) : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    {showOtherRow && (
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <td className="px-3 py-2 sticky left-0 bg-gray-50 border-r border-gray-100">
                          <div className="pl-3 text-gray-700 font-medium">Other ({otherProductCount} products)</div>
                        </td>
                        {fyChunk.months.map((month, i) => {
                          const actual = chunkActuals[i];
                          const totalVariance = actual != null ? actual - month.amount : null;
                          const visibleTotal = visibleProducts.reduce((sum, product) => {
                            const forecast = product.hasForecast
                              ? product.monthlyTotals[fyChunk.startIndex + i]?.amount ?? 0
                              : null;
                            const productActual = product.monthlyActuals[fyChunk.startIndex + i];
                            return productActual != null && forecast != null ? sum + productActual - forecast : sum;
                          }, 0);
                          const residual = totalVariance != null ? totalVariance - visibleTotal : null;
                          return (
                            <td
                              key={monthKey(month.year, month.month)}
                              className={`px-2 py-2 text-center whitespace-nowrap ${
                                residual != null ? varianceClass(residual) : 'text-gray-400'
                              }`}
                            >
                              {residual != null ? formatResidualVariance(residual, group.currency) : '—'}
                            </td>
                          );
                        })}
                        <td
                          className={`px-3 py-2 text-center whitespace-nowrap ${
                            chunkHasActuals ? varianceClass(chunkVarianceTotal) : 'text-gray-400'
                          }`}
                        >
                          {chunkHasActuals
                            ? formatResidualVariance(
                                chunkVarianceTotal -
                                  visibleProducts.reduce((sum, product) => {
                                    const { variances } = productChunkValues(product, fyChunk);
                                    return sum + sumNullable(variances);
                                  }, 0),
                                group.currency,
                              )
                            : '—'}
                        </td>
                      </tr>
                    )}
                    <tr className={showProducts ? 'bg-amber-50/40 font-semibold' : ''}>
                      <td className="px-3 py-2 text-gray-700 sticky left-0 bg-inherit border-r border-gray-100">
                        {showProducts ? 'Variance total' : 'Variance'}
                      </td>
                      {fyChunk.months.map((v, i) => {
                        const actual = chunkActuals[i];
                        const variance = actual != null ? actual - v.amount : null;
                        return (
                          <td
                            key={monthKey(v.year, v.month)}
                            className={`px-2 py-2 text-center whitespace-nowrap ${
                              variance != null ? varianceClass(variance) : 'text-gray-400'
                            }`}
                          >
                            {variance != null ? formatVariance(variance, group.currency) : '—'}
                          </td>
                        );
                      })}
                      <td
                        className={`px-3 py-2 text-center font-semibold whitespace-nowrap ${
                          chunkHasActuals ? varianceClass(chunkVarianceTotal) : 'text-gray-400'
                        }`}
                      >
                        {chunkHasActuals ? formatVariance(chunkVarianceTotal, group.currency) : '—'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4">
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {values.length}-month forecast total ({group.currency})
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {formatForecastAmount(grandTotal, group.currency)}
          </div>
          <div className="text-xs text-gray-600 mt-1">{yearRangeLabel(values)}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Actuals to date ({group.currency})
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {hasActuals ? formatForecastAmount(actualToDate, group.currency) : '—'}
          </div>
          {hasActuals ? (
            <div className={`text-sm mt-1 ${varianceClass(actualToDate - forecastForActualMonths)}`}>
              {formatVariance(actualToDate - forecastForActualMonths, group.currency)} vs forecast for closed months
            </div>
          ) : (
            <div className="text-xs text-gray-600 mt-1">No closed-month spend reported yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

const publicCloudForecastPage = createClientPage({
  permissions: [GlobalPermissions.ViewPublicCloudAccountability],
  fallbackUrl: '/login?callbackUrl=/home',
});

export default publicCloudForecastPage(() => {
  const { data, isLoading } = useQuery<PlatformForecastSummary>({
    queryKey: ['accountability-platform-forecast'],
    queryFn: () => getPlatformForecast(),
  });

  const coverage =
    data && data.totalProducts > 0 ? Math.round((data.productsWithForecast / data.totalProducts) * 100) : 0;

  return (
    <LoadingBox isLoading={isLoading}>
      <div className="space-y-6 p-4">
        <div className="flex flex-wrap items-start gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold">Public Cloud Forecast</h1>
            <p className="text-sm text-gray-600 mt-1">
              Read-only rollup of the latest approved forecast for every active public cloud product, with closed-month
              actuals and variance. All forecasts are in CAD. AWS invoice actuals arriving in USD are converted with the
              monthly USD/CAD rate so platform totals stay in one currency.
            </p>
          </div>
          <ExportButton className="ml-auto shrink-0" onExport={() => downloadPlatformForecastExport()} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Active projects" value={String(data?.totalProducts ?? 0)} />
          <SummaryCard label="With approved forecast" value={String(data?.productsWithForecast ?? 0)} />
          <SummaryCard
            label="Forecast coverage"
            value={`${coverage}%`}
            hint="Products missing an approved forecast are not included in the totals below."
          />
        </div>

        {data?.groups.length ? (
          <div className="space-y-10">
            {data.groups.map((group) => (
              <PlatformForecastGrid key={group.currency} group={group} />
            ))}
          </div>
        ) : (
          !isLoading && <p className="text-sm text-gray-600">No active public cloud products found.</p>
        )}
      </div>
    </LoadingBox>
  );
});
