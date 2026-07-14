import ExcelJS from 'exceljs';
import {
  aggregateMonthlyTotalsFromProducts,
  formatForecastProviderList,
  getFiscalYearChunks,
  getProviderSpendLabel,
  shortMonthLabel,
  sumMonthlyValues,
  yearRangeLabel,
  type MonthlyValue,
} from '@/components/public-cloud/forecast/forecast-grid-utils';
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
  products: PlatformForecastProduct[];
};

function providerLabel(providers: string[]) {
  return formatForecastProviderList(providers);
}

function cadCurrencyFormat() {
  return '"CA$"#,##0';
}

function sanitizeSheetName(name: string) {
  return name.replace(/[\\/*?[\]:]/g, '-').slice(0, 31) || 'Sheet';
}

function buildFilteredGroupTotals(products: PlatformForecastProduct[], currency: string): MonthlyValue[] {
  return aggregateMonthlyTotalsFromProducts(products, currency);
}

function buildExportSheets(summary: PlatformForecastSummary): ForecastExportSheet[] {
  const sheets: ForecastExportSheet[] = [];

  for (const group of summary.groups) {
    const forecastProducts = group.products.filter((product) => product.hasForecast);

    sheets.push({
      sheetName: sanitizeSheetName(`All - ${group.currency}`),
      title: `Cloud Spend — All providers (${group.currency})`,
      subtitle: `${group.forecastCount} of ${group.productCount} products with a forecast · Currency: ${group.currency}`,
      currency: group.currency,
      providers: group.providers,
      productCount: group.productCount,
      forecastCount: group.forecastCount,
      monthlyTotals: group.monthlyTotals as MonthlyValue[],
      products: forecastProducts,
    });

    const providers = [...group.providers].sort((a, b) => providerLabel([a]).localeCompare(providerLabel([b])));
    for (const provider of providers) {
      const products = group.products.filter((product) => product.provider === provider && product.hasForecast);
      const allProviderProducts = group.products.filter((product) => product.provider === provider);
      const monthlyTotals = buildFilteredGroupTotals(products, group.currency);
      const forecastCount = products.length;

      sheets.push({
        sheetName: sanitizeSheetName(providerLabel([provider])),
        title: `${getProviderSpendLabel(provider)} (${group.currency})`,
        subtitle: `${forecastCount} of ${allProviderProducts.length} products with a forecast · Currency: ${group.currency}`,
        currency: group.currency,
        providers: [provider],
        productCount: allProviderProducts.length,
        forecastCount,
        monthlyTotals,
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

function styleTotalRow(row: ExcelJS.Row, colCount: number) {
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
      cell.numFmt = cadCurrencyFormat();
    }
  }
}

function styleProductRow(row: ExcelJS.Row, colCount: number, alt: boolean) {
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
        cell.numFmt = cadCurrencyFormat();
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
  styleTitleRow(title, 5);
  sheet.mergeCells(1, 1, 1, 5);

  sheet.addRow([]);
  const generated = sheet.addRow(['Generated', new Date()]);
  generated.getCell(1).font = { bold: true, size: 10, color: { argb: `FF${COLORS.subtitleFg}` } };
  generated.getCell(2).numFmt = 'yyyy-mm-dd hh:mm';
  generated.getCell(2).font = { size: 10 };

  const note = sheet.addRow(['All amounts are in CAD.']);
  note.font = { size: 10, italic: true, color: { argb: `FF${COLORS.subtitleFg}` } };
  sheet.mergeCells(note.number, 1, note.number, 5);

  sheet.addRow([]);
  const kpiHeader = sheet.addRow(['Coverage']);
  styleSectionRow(kpiHeader, 2);
  sheet.mergeCells(kpiHeader.number, 1, kpiHeader.number, 2);

  const kpis = [
    ['Active projects', summary.totalProducts],
    ['With a forecast', summary.productsWithForecast],
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
  const tableHeader = sheet.addRow(['Sheet', 'Providers', 'Product count', 'Forecast count', 'Forecast total']);
  styleHeaderRow(tableHeader, 5);

  sheets.forEach((exportSheet, index) => {
    const row = sheet.addRow([
      exportSheet.sheetName,
      providerLabel(exportSheet.providers),
      exportSheet.productCount,
      exportSheet.forecastCount,
      sumMonthlyValues(exportSheet.monthlyTotals),
    ]);

    for (let col = 1; col <= 5; col++) {
      const cell = row.getCell(col);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: `FF${index % 2 ? COLORS.altProductBg : COLORS.productBg}` },
      };
      cell.font = { size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: col <= 2 ? 'left' : 'right' };
    }

    row.getCell(5).numFmt = cadCurrencyFormat();
  });

  sheet.getColumn(1).width = 18;
  sheet.getColumn(2).width = 22;
  sheet.getColumn(3).width = 14;
  sheet.getColumn(4).width = 14;
  sheet.getColumn(5).width = 16;
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

  const title = sheet.addRow([exportSheet.title]);
  styleTitleRow(title, colCount);
  sheet.mergeCells(1, 1, 1, colCount);

  const subtitle = sheet.addRow([exportSheet.subtitle]);
  subtitle.font = { size: 10, italic: true, color: { argb: `FF${COLORS.subtitleFg}` } };
  sheet.mergeCells(subtitle.number, 1, subtitle.number, colCount);

  sheet.addRow([]);

  for (const fyChunk of fiscalYearChunks) {
    const yearTotal = sumMonthlyValues(fyChunk.months);
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

    exportSheet.products.forEach((product, index) => {
      const forecasts = fyChunk.months.map((_, i) => product.monthlyTotals[fyChunk.startIndex + i]?.amount ?? 0);
      const productYearTotal = forecasts.reduce((sum, v) => sum + v, 0);
      const row = sheet.addRow([`${product.name} (${product.licencePlate})`, ...forecasts, productYearTotal]);
      styleProductRow(row, fyColCount, index % 2 === 1);
    });

    const forecastTotal = sheet.addRow(['Forecast total', ...fyChunk.months.map((month) => month.amount), yearTotal]);
    styleTotalRow(forecastTotal, fyColCount);

    sheet.addRow([]);
  }

  const grandTotal = sumMonthlyValues(exportSheet.monthlyTotals);

  const footerHeader = sheet.addRow(['Horizon totals']);
  styleSectionRow(footerHeader, 2);

  const footerRow = sheet.addRow([`${exportSheet.monthlyTotals.length}-month forecast total`, grandTotal]);
  footerRow.getCell(1).font = { bold: true, size: 10 };
  footerRow.getCell(2).font = { bold: true, size: 11 };
  footerRow.getCell(2).alignment = { horizontal: 'right' };
  footerRow.getCell(2).numFmt = cadCurrencyFormat();

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
