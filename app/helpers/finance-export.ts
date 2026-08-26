import ExcelJS from 'exceljs';
import { formatCadAmount } from '@/components/public-cloud/finance/finance-measure-utils';
import { getFinanceRankings, getFinanceSnapshot, type ProviderFilter } from '@/services/db/public-cloud-finance';
import { getPlatformForecastSummary } from '@/services/db/public-cloud-forecast';

function contentDispositionAttachment(filename: string) {
  const sanitized = filename.replace(/[\r\n"\\]/g, '').trim() || 'download';
  const encoded = encodeURIComponent(sanitized);
  return `attachment; filename="${sanitized}"; filename*=UTF-8''${encoded}`;
}

export { contentDispositionAttachment };

type Snapshot = Awaited<ReturnType<typeof getFinanceSnapshot>>;
type Rankings = Awaited<ReturnType<typeof getFinanceRankings>>;
type ForecastSummary = Awaited<ReturnType<typeof getPlatformForecastSummary>>;
type ForecastProduct = ForecastSummary['groups'][number]['products'][number];

function formatExportProductName(product: Pick<ForecastProduct, 'name' | 'status'>) {
  return product.status === 'INACTIVE' ? `${product.name} (archived)` : product.name;
}

function matchesProviderFilter(productProvider: ForecastProduct['provider'], provider: ProviderFilter) {
  return provider === 'ALL' || productProvider === provider;
}

function addForecastProductRows(sheet: ExcelJS.Worksheet, product: ForecastProduct, provider: ProviderFilter) {
  if (!product.hasForecast || !matchesProviderFilter(product.provider, provider)) return;

  const displayName = formatExportProductName(product);
  for (const month of product.monthlyTotals) {
    sheet.addRow([product.licencePlate, displayName, product.provider, month.year, month.month, month.amount]);
  }
}

function addForecastSheet(workbook: ExcelJS.Workbook, forecastSummary: ForecastSummary, provider: ProviderFilter) {
  const sheet = workbook.addWorksheet('Forecast by month');
  sheet.addRow(['Project identifier', 'Name', 'Provider', 'Year', 'Month', 'Forecast CAD']);
  for (const group of forecastSummary.groups) {
    for (const product of group.products) {
      addForecastProductRows(sheet, product, provider);
    }
  }
}

function addActualsSheet(workbook: ExcelJS.Workbook, snapshot: Snapshot) {
  const sheet = workbook.addWorksheet('Actuals by month');
  sheet.addRow(['Year', 'Month', 'Actual CAD', 'Forecast CAD', 'Partial current month']);
  for (const row of snapshot.monthlyChart) {
    sheet.addRow([row.year, row.month, row.actual ?? '', row.forecast, row.isCurrentPartial ? 'yes' : '']);
  }
}

function addVarianceSheet(workbook: ExcelJS.Workbook, snapshot: Snapshot) {
  const sheet = workbook.addWorksheet('Variance summary');
  sheet.addRow(['FYTD actual', snapshot.fytdActual ?? 'no data']);
  sheet.addRow([
    'FYTD actual months',
    `${snapshot.actualsCoverage.presentMonths} of ${snapshot.actualsCoverage.expectedMonths}`,
  ]);
  sheet.addRow(['FYTD forecast', snapshot.fytdForecast]);
  sheet.addRow(['FYTD variance amount', snapshot.fytdVariance?.amount ?? 'no data']);
  sheet.addRow(['FYTD variance percent', snapshot.fytdVariance?.percent ?? 'no data']);
  sheet.addRow(['Full year forecast', snapshot.fullYearForecast]);
  sheet.addRow(['Excluded products', snapshot.coverage.excludedFromForecastTotals]);
  sheet.addRow(['Low coverage mode', snapshot.lowCoverage ? 'yes' : 'no']);
}

function addProductRankingsSheet(workbook: ExcelJS.Workbook, rankings: Rankings) {
  const sheet = workbook.addWorksheet('Product rankings');
  sheet.addRow(['Rank', 'Project identifier', 'Name', 'Status', 'Amount CAD', 'Share', 'YoY %']);
  for (const row of rankings.products) {
    sheet.addRow([
      row.rank,
      row.licencePlate,
      row.name,
      row.status,
      row.amountCad,
      row.shareOfTotal,
      row.yoyChangePercent ?? '',
    ]);
  }
}

function addServiceLineRankingsSheet(workbook: ExcelJS.Workbook, rankings: Rankings) {
  const sheet = workbook.addWorksheet('Service line rankings');
  sheet.addRow(['Rank', 'Service line', 'Amount CAD', 'Share', 'YoY %']);
  for (const row of rankings.serviceLines) {
    sheet.addRow([row.rank, row.serviceLine, row.amountCad, row.shareOfTotal, row.yoyChangePercent ?? '']);
  }
}

export async function buildFinanceWorkbookBuffer(options: {
  provider: ProviderFilter;
  period: 'ytd' | 'full-fy';
  datasets: string[];
}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Platform Services Registry';
  workbook.created = new Date();

  const snapshot = await getFinanceSnapshot(options.provider);
  const rankings = await getFinanceRankings({
    provider: options.provider,
    period: options.period,
    limit: 100,
  });
  const forecastSummary = await getPlatformForecastSummary();

  const meta = workbook.addWorksheet('Export metadata');
  meta.addRow(['Generated at', new Date().toISOString()]);
  meta.addRow(['Period', options.period]);
  meta.addRow(['Provider filter', options.provider]);
  meta.addRow(['Fiscal year', snapshot.fiscalYearLabel]);
  meta.addRow([
    'Forecast coverage',
    `${snapshot.coverage.percent}% (${snapshot.coverage.completeCount}/${snapshot.coverage.productCount})`,
  ]);
  meta.addRow(['Datasets', options.datasets.join(', ')]);
  meta.addRow(['Note', 'Variance notes and anomaly flags are excluded from exports.']);

  const excluded = workbook.addWorksheet('Excluded from forecast totals');
  excluded.addRow(['Project identifier', 'Reason']);
  // Products without forecast are counted; list from coverage chase would be ideal — use ranking products missing amount with no forecast via snapshot count note.
  excluded.addRow([
    `${snapshot.coverage.excludedFromForecastTotals} products`,
    'No forecast entered — excluded from forecast rollups',
  ]);

  if (options.datasets.includes('forecast')) {
    addForecastSheet(workbook, forecastSummary, options.provider);
  }
  if (options.datasets.includes('actuals')) {
    addActualsSheet(workbook, snapshot);
  }
  if (options.datasets.includes('variance')) {
    addVarianceSheet(workbook, snapshot);
  }
  if (options.datasets.includes('product-rankings')) {
    addProductRankingsSheet(workbook, rankings);
  }
  if (options.datasets.includes('service-line-rankings')) {
    addServiceLineRankingsSheet(workbook, rankings);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function csvNumber(value: number | null | undefined) {
  return value == null ? '' : String(value);
}

function appendForecastCsvRows(
  rows: Array<Record<string, string>>,
  forecastSummary: ForecastSummary,
  provider: ProviderFilter,
) {
  for (const group of forecastSummary.groups) {
    for (const product of group.products) {
      appendForecastProductCsvRows(rows, product, provider);
    }
  }
}

function appendForecastProductCsvRows(
  rows: Array<Record<string, string>>,
  product: ForecastProduct,
  provider: ProviderFilter,
) {
  if (!product.hasForecast || !matchesProviderFilter(product.provider, provider)) return;
  for (const month of product.monthlyTotals) {
    rows.push({
      dataset: 'forecast',
      project_identifier: product.licencePlate,
      name: formatExportProductName(product),
      provider: product.provider,
      year: String(month.year),
      month: String(month.month),
      amount_cad: String(month.amount),
    });
  }
}

function appendActualsCsvRows(rows: Array<Record<string, string>>, snapshot: Snapshot) {
  for (const row of snapshot.monthlyChart) {
    rows.push({
      dataset: 'actuals',
      year: String(row.year),
      month: String(row.month),
      actual_cad: csvNumber(row.actual),
      forecast_cad: String(row.forecast),
    });
  }
}

function appendVarianceCsvRows(rows: Array<Record<string, string>>, snapshot: Snapshot) {
  rows.push({
    dataset: 'variance',
    fytd_actual: csvNumber(snapshot.fytdActual),
    fytd_forecast: String(snapshot.fytdForecast),
    fytd_variance_amount: csvNumber(snapshot.fytdVariance?.amount),
  });
}

function appendProductRankingCsvRows(rows: Array<Record<string, string>>, rankings: Rankings) {
  for (const row of rankings.products) {
    rows.push({
      dataset: 'product-rankings',
      rank: String(row.rank),
      project_identifier: row.licencePlate,
      amount_cad: String(row.amountCad),
      share: String(row.shareOfTotal),
      yoy_percent: csvNumber(row.yoyChangePercent),
    });
  }
}

function appendServiceLineRankingCsvRows(rows: Array<Record<string, string>>, rankings: Rankings) {
  for (const row of rankings.serviceLines) {
    rows.push({
      dataset: 'service-line-rankings',
      rank: String(row.rank),
      service_line: row.serviceLine,
      amount_cad: String(row.amountCad),
      share: String(row.shareOfTotal),
      yoy_percent: csvNumber(row.yoyChangePercent),
    });
  }
}

function appendSnapshotCsvRows(rows: Array<Record<string, string>>, snapshot: Snapshot, datasets: string[]) {
  if (datasets.includes('actuals')) appendActualsCsvRows(rows, snapshot);
  if (datasets.includes('variance')) appendVarianceCsvRows(rows, snapshot);
}

function appendRankingCsvRows(rows: Array<Record<string, string>>, rankings: Rankings, datasets: string[]) {
  if (datasets.includes('product-rankings')) appendProductRankingCsvRows(rows, rankings);
  if (datasets.includes('service-line-rankings')) appendServiceLineRankingCsvRows(rows, rankings);
}

const FINANCE_CSV_COLUMNS = [
  'dataset',
  'project_identifier',
  'name',
  'provider',
  'year',
  'month',
  'rank',
  'service_line',
  'amount_cad',
  'actual_cad',
  'forecast_cad',
  'share',
  'yoy_percent',
  'fytd_actual',
  'fytd_forecast',
  'fytd_variance_amount',
];

export async function buildFinanceExportCsvRows(options: {
  provider: ProviderFilter;
  period: 'ytd' | 'full-fy';
  datasets: string[];
}) {
  const rows: Array<Record<string, string>> = [];
  const snapshot = options.datasets.some((dataset) => ['actuals', 'variance', 'forecast'].includes(dataset))
    ? await getFinanceSnapshot(options.provider)
    : null;
  const rankings = options.datasets.some((dataset) => ['product-rankings', 'service-line-rankings'].includes(dataset))
    ? await getFinanceRankings({ provider: options.provider, period: options.period, limit: 100 })
    : null;
  const forecastSummary = options.datasets.includes('forecast') ? await getPlatformForecastSummary() : null;

  if (forecastSummary) appendForecastCsvRows(rows, forecastSummary, options.provider);
  if (snapshot) appendSnapshotCsvRows(rows, snapshot, options.datasets);
  if (rankings) appendRankingCsvRows(rows, rankings, options.datasets);

  return rows.map((row) => Object.fromEntries(FINANCE_CSV_COLUMNS.map((column) => [column, row[column] ?? ''])));
}

export function financeAmountLabel(amount: number | null | undefined) {
  return formatCadAmount(amount);
}
