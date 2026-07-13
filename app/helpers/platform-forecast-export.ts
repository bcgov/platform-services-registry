import ExcelJS from 'exceljs';
import {
  getFiscalYearChunks,
  getProviderSpendLabel,
  mergeMonthlyValuesOntoFiscalHorizon,
  monthKey,
  shortMonthLabel,
  sumMonthlyValues,
  yearRangeLabel,
  type MonthlyValue,
} from '@/components/public-cloud/forecast/forecast-grid-utils';
import { Provider } from '@/prisma/client';
import type { PlatformForecastProduct, PlatformForecastSummary } from '@/services/db/public-cloud-forecast';

const COLORS = {
  titleBg: '003366',
  titleFg: 'FFFFFF',
  subtitleFg: '4B5563',
  sectionBg: 'E5E7EB',
  sectionFg: '374151',
  headerBg: '1E3A5F',
  headerFg: 'FFFFFF',
  totalBg: 'FEF3C7',
  totalFg: '111827',
  productBg: 'FFFFFF',
  altProductBg: 'F9FAFB',
  border: 'D1D5DB',
  overspend: 'DC2626',
  underspend: '059669',
  muted: '9CA3AF',
};

type ForecastExportSheet = {
  sheetName: string;
  title: string;
  subtitle: string;
  currency: string;
  providers: string[];
  productCount: number;
  forecastCount: number;
  monthlyTotals: MonthlyValue[];
  monthlyActuals: (number | null)[];
  products: PlatformForecastProduct[];
};

function providerLabel(providers: string[]) {
  return providers
    .map((provider) => {
      if (provider === Provider.AWS_LZA) return 'AWS LZA';
      if (provider === Provider.AWS) return 'AWS';
      if (provider === Provider.AZURE) return 'Azure';
      return provider;
    })
    .join(' / ');
}

function currencyFormat(currency: string) {
  return currency === 'USD' ? '"$"#,##0' : '"CA$"#,##0';
}

function varianceFormat(currency: string) {
  // Keep the sign visible; color is applied separately (red overspend / green underspend).
  return currency === 'USD' ? '"$"#,##0;[Red]\\-"$"#,##0' : '"CA$"#,##0;[Red]\\-"CA$"#,##0';
}

function sanitizeSheetName(name: string) {
  return name.replace(/[\\/*?[\]:]/g, '-').slice(0, 31) || 'Sheet';
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

function buildExportSheets(summary: PlatformForecastSummary): ForecastExportSheet[] {
  const sheets: ForecastExportSheet[] = [];

  for (const group of summary.groups) {
    const includesAws = group.providers.some((provider) => provider === Provider.AWS || provider === Provider.AWS_LZA);
    const fxNote = includesAws ? ' · AWS USD actuals converted to CAD with the monthly FX rate' : '';

    sheets.push({
      sheetName: sanitizeSheetName(`All - ${group.currency}`),
      title: `Cloud Spend — All providers (${group.currency})`,
      subtitle: `${group.forecastCount} of ${group.productCount} products with an approved forecast · Currency: ${group.currency}${fxNote}`,
      currency: group.currency,
      providers: group.providers,
      productCount: group.productCount,
      forecastCount: group.forecastCount,
      monthlyTotals: group.monthlyTotals as MonthlyValue[],
      monthlyActuals: group.monthlyActuals,
      products: group.products,
    });

    const providers = [...group.providers].sort((a, b) => providerLabel([a]).localeCompare(providerLabel([b])));
    for (const provider of providers) {
      const products = group.products.filter((product) => product.provider === provider);
      const totals = buildFilteredGroupTotals(products, group.currency);
      const forecastCount = products.filter((product) => product.hasForecast).length;
      const providerFxNote =
        provider === Provider.AWS || provider === Provider.AWS_LZA
          ? ' · AWS USD actuals converted to CAD with the monthly FX rate'
          : '';

      sheets.push({
        sheetName: sanitizeSheetName(providerLabel([provider])),
        title: `${getProviderSpendLabel(provider)} (${group.currency})`,
        subtitle: `${forecastCount} of ${products.length} products with an approved forecast · Currency: ${group.currency}${providerFxNote}`,
        currency: group.currency,
        providers: [provider],
        productCount: products.length,
        forecastCount,
        monthlyTotals: totals.monthlyTotals,
        monthlyActuals: totals.monthlyActuals,
        products,
      });
    }
  }

  return sheets;
}

function styleTitleRow(row: ExcelJS.Row, colCount: number) {
  row.height = 28;
  for (let col = 1; col <= colCount; col++) {
    const cell = row.getCell(col);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${COLORS.titleBg}` } };
    cell.font = { bold: true, size: 14, color: { argb: `FF${COLORS.titleFg}` } };
    cell.alignment = { vertical: 'middle', horizontal: col === 1 ? 'left' : 'center' };
  }
}

function styleSectionRow(row: ExcelJS.Row, colCount: number) {
  row.height = 20;
  for (let col = 1; col <= colCount; col++) {
    const cell = row.getCell(col);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${COLORS.sectionBg}` } };
    cell.font = { bold: true, size: 10, color: { argb: `FF${COLORS.sectionFg}` } };
    cell.alignment = { vertical: 'middle' };
  }
}

function styleHeaderRow(row: ExcelJS.Row, colCount: number) {
  row.height = 22;
  for (let col = 1; col <= colCount; col++) {
    const cell = row.getCell(col);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${COLORS.headerBg}` } };
    cell.font = { bold: true, size: 10, color: { argb: `FF${COLORS.headerFg}` } };
    cell.alignment = { vertical: 'middle', horizontal: col === 1 ? 'left' : 'center' };
    cell.border = {
      bottom: { style: 'thin', color: { argb: `FF${COLORS.border}` } },
    };
  }
}

function styleTotalRow(row: ExcelJS.Row, colCount: number, currency: string, isVariance = false) {
  row.height = 20;
  for (let col = 1; col <= colCount; col++) {
    const cell = row.getCell(col);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${COLORS.totalBg}` } };
    cell.font = { bold: true, size: 10, color: { argb: `FF${COLORS.totalFg}` } };
    cell.alignment = { vertical: 'middle', horizontal: col === 1 ? 'left' : 'right' };
    cell.border = {
      top: { style: 'thin', color: { argb: `FF${COLORS.border}` } },
      bottom: { style: 'thin', color: { argb: `FF${COLORS.border}` } },
    };
    if (col > 1 && typeof cell.value === 'number') {
      cell.numFmt = isVariance ? varianceFormat(currency) : currencyFormat(currency);
      if (isVariance) {
        cell.font = {
          bold: true,
          size: 10,
          color: {
            argb: `FF${cell.value > 0 ? COLORS.overspend : cell.value < 0 ? COLORS.underspend : COLORS.totalFg}`,
          },
        };
      }
    }
  }
}

function styleProductRow(row: ExcelJS.Row, colCount: number, currency: string, alt: boolean, isVariance = false) {
  row.height = 18;
  for (let col = 1; col <= colCount; col++) {
    const cell = row.getCell(col);
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: `FF${alt ? COLORS.altProductBg : COLORS.productBg}` },
    };
    cell.font = { size: 10, color: { argb: 'FF111827' } };
    cell.alignment = { vertical: 'middle', horizontal: col === 1 ? 'left' : 'right', indent: col === 1 ? 1 : 0 };
    if (col > 1) {
      if (typeof cell.value === 'number') {
        cell.numFmt = isVariance ? varianceFormat(currency) : currencyFormat(currency);
        if (isVariance) {
          cell.font = {
            size: 10,
            color: {
              argb: `FF${cell.value > 0 ? COLORS.overspend : cell.value < 0 ? COLORS.underspend : '111827'}`,
            },
          };
        }
      } else if (cell.value === '' || cell.value == null) {
        cell.value = '—';
        cell.font = { size: 10, color: { argb: `FF${COLORS.muted}` } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    }
  }
}

function setColumnWidths(sheet: ExcelJS.Worksheet, firstColWidth: number, valueCols: number) {
  sheet.getColumn(1).width = firstColWidth;
  for (let col = 2; col <= valueCols + 1; col++) {
    sheet.getColumn(col).width = 12;
  }
}

function addSummarySheet(workbook: ExcelJS.Workbook, summary: PlatformForecastSummary, sheets: ForecastExportSheet[]) {
  const sheet = workbook.addWorksheet('Summary', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });
  const coverage =
    summary.totalProducts > 0 ? Math.round((summary.productsWithForecast / summary.totalProducts) * 100) : 0;

  const title = sheet.addRow(['Public Cloud Forecast']);
  styleTitleRow(title, 7);
  sheet.mergeCells(1, 1, 1, 7);

  sheet.addRow([]);
  const generated = sheet.addRow(['Generated', new Date()]);
  generated.getCell(1).font = { bold: true, size: 10, color: { argb: `FF${COLORS.subtitleFg}` } };
  generated.getCell(2).numFmt = 'yyyy-mm-dd hh:mm';
  generated.getCell(2).font = { size: 10 };

  const note = sheet.addRow([
    'All amounts are in CAD. AWS invoice actuals arriving in USD are converted with the monthly USD/CAD rate.',
  ]);
  note.font = { size: 10, italic: true, color: { argb: `FF${COLORS.subtitleFg}` } };
  sheet.mergeCells(note.number, 1, note.number, 7);

  sheet.addRow([]);
  const kpiHeader = sheet.addRow(['Coverage']);
  styleSectionRow(kpiHeader, 2);
  sheet.mergeCells(kpiHeader.number, 1, kpiHeader.number, 2);

  const kpis = [
    ['Active projects', summary.totalProducts],
    ['With approved forecast', summary.productsWithForecast],
    ['Forecast coverage %', coverage],
  ] as const;
  for (const [label, value] of kpis) {
    const row = sheet.addRow([label, value]);
    row.getCell(1).font = { size: 10 };
    row.getCell(2).font = { bold: true, size: 11 };
    row.getCell(2).alignment = { horizontal: 'right' };
    if (label.includes('%')) row.getCell(2).numFmt = '0"%"';
  }

  sheet.addRow([]);
  const tableHeader = sheet.addRow([
    'Sheet',
    'Providers',
    'Product count',
    'Forecast count',
    'Forecast total',
    'Actuals to date',
    'Variance to date',
  ]);
  styleHeaderRow(tableHeader, 7);

  sheets.forEach((exportSheet, index) => {
    const actualToDate = exportSheet.monthlyActuals.reduce<number>((sum, v) => sum + (v ?? 0), 0);
    const forecastForActualMonths = exportSheet.monthlyTotals.reduce(
      (sum, month, i) => (exportSheet.monthlyActuals[i] != null ? sum + month.amount : sum),
      0,
    );
    const hasActuals = exportSheet.monthlyActuals.some((v) => v != null);
    const variance = hasActuals ? actualToDate - forecastForActualMonths : null;

    const row = sheet.addRow([
      exportSheet.sheetName,
      providerLabel(exportSheet.providers),
      exportSheet.productCount,
      exportSheet.forecastCount,
      sumMonthlyValues(exportSheet.monthlyTotals),
      hasActuals ? actualToDate : '',
      variance ?? '',
    ]);

    for (let col = 1; col <= 7; col++) {
      const cell = row.getCell(col);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: `FF${index % 2 ? COLORS.altProductBg : COLORS.productBg}` },
      };
      cell.font = { size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: col <= 2 ? 'left' : 'right' };
    }

    row.getCell(5).numFmt = currencyFormat(exportSheet.currency);
    if (hasActuals) {
      row.getCell(6).numFmt = currencyFormat(exportSheet.currency);
      row.getCell(7).numFmt = varianceFormat(exportSheet.currency);
      if (typeof variance === 'number') {
        row.getCell(7).font = {
          size: 10,
          color: { argb: `FF${variance > 0 ? COLORS.overspend : variance < 0 ? COLORS.underspend : '111827'}` },
        };
      }
    } else {
      row.getCell(6).value = '—';
      row.getCell(7).value = '—';
      row.getCell(6).font = { size: 10, color: { argb: `FF${COLORS.muted}` } };
      row.getCell(7).font = { size: 10, color: { argb: `FF${COLORS.muted}` } };
      row.getCell(6).alignment = { horizontal: 'center' };
      row.getCell(7).alignment = { horizontal: 'center' };
    }
  });

  sheet.getColumn(1).width = 18;
  sheet.getColumn(2).width = 22;
  sheet.getColumn(3).width = 14;
  sheet.getColumn(4).width = 14;
  sheet.getColumn(5).width = 16;
  sheet.getColumn(6).width = 16;
  sheet.getColumn(7).width = 16;
}

function addDetailSheet(workbook: ExcelJS.Workbook, exportSheet: ForecastExportSheet) {
  const spendLabel =
    exportSheet.providers.length === 1
      ? getProviderSpendLabel(exportSheet.providers[0])
      : `Cloud Spend (${exportSheet.currency})`;
  const sheet = workbook.addWorksheet(exportSheet.sheetName, {
    views: [{ state: 'frozen', xSplit: 1, ySplit: 1 }],
  });

  const fiscalYearChunks = getFiscalYearChunks(exportSheet.monthlyTotals);
  const maxMonths = Math.max(...fiscalYearChunks.map((chunk) => chunk.months.length), 1);
  const colCount = maxMonths + 2;
  const lineItemProducts = exportSheet.products.filter(
    (product) => product.hasForecast || product.monthlyActuals.some((v) => v != null),
  );

  const title = sheet.addRow([exportSheet.title]);
  styleTitleRow(title, colCount);
  sheet.mergeCells(1, 1, 1, colCount);

  const subtitle = sheet.addRow([exportSheet.subtitle]);
  subtitle.font = { size: 10, italic: true, color: { argb: `FF${COLORS.subtitleFg}` } };
  sheet.mergeCells(subtitle.number, 1, subtitle.number, colCount);

  sheet.addRow([]);

  for (const fyChunk of fiscalYearChunks) {
    const yearTotal = sumMonthlyValues(fyChunk.months);
    const chunkActuals = fyChunk.months.map((_, i) => exportSheet.monthlyActuals[fyChunk.startIndex + i] ?? null);
    const chunkHasActuals = chunkActuals.some((v) => v != null);
    const chunkActualTotal = chunkActuals.reduce<number>((sum, v) => sum + (v ?? 0), 0);
    const chunkVarianceTotal = fyChunk.months.reduce(
      (sum, month, i) => (chunkActuals[i] != null ? sum + (chunkActuals[i]! - month.amount) : sum),
      0,
    );
    const fyColCount = fyChunk.months.length + 2;

    const fyHeader = sheet.addRow([`${fyChunk.label} (${yearRangeLabel(fyChunk.months)})`]);
    styleSectionRow(fyHeader, fyColCount);
    sheet.mergeCells(fyHeader.number, 1, fyHeader.number, fyColCount);

    const header = sheet.addRow([
      spendLabel,
      ...fyChunk.months.map((month) => shortMonthLabel(month.year, month.month)),
      'TOTAL',
    ]);
    styleHeaderRow(header, fyColCount);

    const forecastSection = sheet.addRow(['Forecast by product']);
    styleSectionRow(forecastSection, fyColCount);
    sheet.mergeCells(forecastSection.number, 1, forecastSection.number, fyColCount);

    lineItemProducts.forEach((product, index) => {
      const forecasts = fyChunk.months.map((_, i) =>
        product.hasForecast ? product.monthlyTotals[fyChunk.startIndex + i]?.amount ?? 0 : '',
      );
      const productYearTotal = product.hasForecast
        ? forecasts.reduce<number>((sum, v) => sum + (typeof v === 'number' ? v : 0), 0)
        : '';
      const row = sheet.addRow([`${product.name} (${product.licencePlate})`, ...forecasts, productYearTotal]);
      styleProductRow(row, fyColCount, exportSheet.currency, index % 2 === 1);
    });

    const forecastTotal = sheet.addRow(['Forecast total', ...fyChunk.months.map((month) => month.amount), yearTotal]);
    styleTotalRow(forecastTotal, fyColCount, exportSheet.currency);

    const actualSection = sheet.addRow(['Actual by product']);
    styleSectionRow(actualSection, fyColCount);
    sheet.mergeCells(actualSection.number, 1, actualSection.number, fyColCount);

    lineItemProducts.forEach((product, index) => {
      const productActuals = fyChunk.months.map((_, i) => product.monthlyActuals[fyChunk.startIndex + i] ?? '');
      const productHasActuals = productActuals.some((v) => v !== '');
      const productActualTotal = productHasActuals
        ? productActuals.reduce<number>((sum, v) => sum + (typeof v === 'number' ? v : 0), 0)
        : '';
      const row = sheet.addRow([`${product.name} (${product.licencePlate})`, ...productActuals, productActualTotal]);
      styleProductRow(row, fyColCount, exportSheet.currency, index % 2 === 1);
    });

    const actualTotal = sheet.addRow([
      'Actual total',
      ...chunkActuals.map((actual) => actual ?? ''),
      chunkHasActuals ? chunkActualTotal : '',
    ]);
    styleTotalRow(actualTotal, fyColCount, exportSheet.currency);

    const varianceSection = sheet.addRow(['Variance by product']);
    styleSectionRow(varianceSection, fyColCount);
    sheet.mergeCells(varianceSection.number, 1, varianceSection.number, fyColCount);

    lineItemProducts.forEach((product, index) => {
      const variances = fyChunk.months.map((_, i) => {
        const actual = product.monthlyActuals[fyChunk.startIndex + i];
        const forecast = product.hasForecast ? product.monthlyTotals[fyChunk.startIndex + i]?.amount ?? 0 : null;
        return actual != null && forecast != null ? actual - forecast : '';
      });
      const productHasVariance = variances.some((v) => v !== '');
      const productVarianceTotal = productHasVariance
        ? variances.reduce<number>((sum, v) => sum + (typeof v === 'number' ? v : 0), 0)
        : '';
      const row = sheet.addRow([`${product.name} (${product.licencePlate})`, ...variances, productVarianceTotal]);
      styleProductRow(row, fyColCount, exportSheet.currency, index % 2 === 1, true);
    });

    const varianceTotal = sheet.addRow([
      'Variance total',
      ...fyChunk.months.map((month, i) => (chunkActuals[i] != null ? chunkActuals[i]! - month.amount : '')),
      chunkHasActuals ? chunkVarianceTotal : '',
    ]);
    styleTotalRow(varianceTotal, fyColCount, exportSheet.currency, true);

    sheet.addRow([]);
  }

  const grandTotal = sumMonthlyValues(exportSheet.monthlyTotals);
  const actualToDate = exportSheet.monthlyActuals.reduce<number>((sum, v) => sum + (v ?? 0), 0);
  const forecastForActualMonths = exportSheet.monthlyTotals.reduce(
    (sum, month, i) => (exportSheet.monthlyActuals[i] != null ? sum + month.amount : sum),
    0,
  );
  const hasActuals = exportSheet.monthlyActuals.some((v) => v != null);

  const footerHeader = sheet.addRow(['Horizon totals']);
  styleSectionRow(footerHeader, 2);

  const footerRows = [
    [`${exportSheet.monthlyTotals.length}-month forecast total`, grandTotal, false],
    ['Actuals to date', hasActuals ? actualToDate : '', false],
    ['Variance vs forecast for closed months', hasActuals ? actualToDate - forecastForActualMonths : '', true],
  ] as const;

  for (const [label, value, isVariance] of footerRows) {
    const row = sheet.addRow([label, value === '' ? '—' : value]);
    row.getCell(1).font = { bold: true, size: 10 };
    row.getCell(2).font = { bold: true, size: 11 };
    row.getCell(2).alignment = { horizontal: 'right' };
    if (typeof value === 'number') {
      row.getCell(2).numFmt = isVariance ? varianceFormat(exportSheet.currency) : currencyFormat(exportSheet.currency);
      if (isVariance) {
        row.getCell(2).font = {
          bold: true,
          size: 11,
          color: { argb: `FF${value > 0 ? COLORS.overspend : value < 0 ? COLORS.underspend : '111827'}` },
        };
      }
    } else {
      row.getCell(2).font = { size: 10, color: { argb: `FF${COLORS.muted}` } };
      row.getCell(2).alignment = { horizontal: 'center' };
    }
  }

  setColumnWidths(sheet, 42, maxMonths + 1);
}

export async function buildPlatformForecastWorkbookBuffer(summary: PlatformForecastSummary): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Platform Services Registry';
  workbook.created = new Date();
  workbook.modified = new Date();

  const sheets = buildExportSheets(summary);
  addSummarySheet(workbook, summary, sheets);
  for (const exportSheet of sheets) {
    addDetailSheet(workbook, exportSheet);
  }

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
