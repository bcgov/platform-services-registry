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
    const sheet = workbook.addWorksheet('Forecast by month');
    sheet.addRow(['Project identifier', 'Name', 'Provider', 'Year', 'Month', 'Forecast CAD']);
    for (const group of forecastSummary.groups) {
      for (const product of group.products) {
        if (!product.hasForecast) continue;
        if (options.provider !== 'ALL' && product.provider !== options.provider) continue;
        for (const month of product.monthlyTotals) {
          sheet.addRow([product.licencePlate, product.name, product.provider, month.year, month.month, month.amount]);
        }
      }
    }
  }

  if (options.datasets.includes('actuals')) {
    const sheet = workbook.addWorksheet('Actuals by month');
    sheet.addRow(['Year', 'Month', 'Actual CAD', 'Forecast CAD', 'Partial current month']);
    for (const row of snapshot.monthlyChart) {
      sheet.addRow([row.year, row.month, row.actual ?? '', row.forecast, row.isCurrentPartial ? 'yes' : '']);
    }
  }

  if (options.datasets.includes('variance')) {
    const sheet = workbook.addWorksheet('Variance summary');
    sheet.addRow(['FYTD actual', snapshot.fytdActual]);
    sheet.addRow(['Full year forecast', snapshot.fullYearForecast]);
    sheet.addRow(['Variance amount', snapshot.variance?.amount ?? 'no data']);
    sheet.addRow(['Variance percent', snapshot.variance?.percent ?? 'no data']);
    sheet.addRow(['Excluded products', snapshot.coverage.excludedFromForecastTotals]);
    sheet.addRow(['Low coverage mode', snapshot.lowCoverage ? 'yes' : 'no']);
  }

  if (options.datasets.includes('product-rankings')) {
    const sheet = workbook.addWorksheet('Product rankings');
    sheet.addRow(['Rank', 'Project identifier', 'Name', 'Amount CAD', 'Share', 'YoY %']);
    for (const row of rankings.products) {
      sheet.addRow([row.rank, row.licencePlate, row.name, row.amountCad, row.shareOfTotal, row.yoyChangePercent ?? '']);
    }
  }

  if (options.datasets.includes('service-line-rankings')) {
    const sheet = workbook.addWorksheet('Service line rankings');
    sheet.addRow(['Rank', 'Service line', 'Amount CAD', 'Share', 'YoY %']);
    for (const row of rankings.serviceLines) {
      sheet.addRow([row.rank, row.serviceLine, row.amountCad, row.shareOfTotal, row.yoyChangePercent ?? '']);
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export function buildFinanceExportCsvRows(options: { provider: ProviderFilter; period: 'ytd' | 'full-fy' }) {
  return getFinanceRankings({ ...options, limit: 100 }).then((rankings) => {
    const rows: string[][] = [
      ['dataset', 'rank', 'project_identifier_or_service', 'amount_cad', 'share', 'yoy_percent'],
    ];
    for (const row of rankings.products) {
      rows.push([
        'product',
        String(row.rank),
        row.licencePlate,
        String(row.amountCad),
        String(row.shareOfTotal),
        row.yoyChangePercent == null ? '' : String(row.yoyChangePercent),
      ]);
    }
    for (const row of rankings.serviceLines) {
      rows.push([
        'service_line',
        String(row.rank),
        row.serviceLine,
        String(row.amountCad),
        String(row.shareOfTotal),
        row.yoyChangePercent == null ? '' : String(row.yoyChangePercent),
      ]);
    }
    rows.push([
      'metadata',
      '',
      `generated=${new Date().toISOString()} period=${options.period} provider=${options.provider}`,
      '',
      '',
      '',
    ]);
    rows.push(['metadata', '', 'variance_notes_and_anomaly_flags_excluded', '', '', '']);
    return rows;
  });
}

export function financeAmountLabel(amount: number | null | undefined) {
  return formatCadAmount(amount);
}
