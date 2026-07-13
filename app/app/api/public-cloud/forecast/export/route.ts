import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { forecastExportResponse, NoContent } from '@/core/responses';
import { buildPlatformForecastWorkbookBuffer } from '@/helpers/platform-forecast-export';
import { buildPlatformForecastExportCsvRows, getPlatformForecastSummary } from '@/services/db/public-cloud-forecast';
import { forecastExportQuerySchema } from '@/validation-schemas/cloud-cost';

function contentDispositionAttachment(filename: string) {
  const sanitized = filename.replace(/[\r\n"\\]/g, '').trim() || 'download';
  const encoded = encodeURIComponent(sanitized);
  return `attachment; filename="${sanitized}"; filename*=UTF-8''${encoded}`;
}

export const GET = createApiHandler({
  permissions: [GlobalPermissions.ViewPublicCloudForecast],
  validations: { queryParams: forecastExportQuerySchema },
})(async ({ queryParams }) => {
  const format = queryParams.format ?? 'xlsx';

  if (format === 'csv') {
    const rows = await buildPlatformForecastExportCsvRows();
    if (!rows.length) {
      return NoContent();
    }
    return forecastExportResponse(rows, 'public-cloud-forecast', 'csv');
  }

  const summary = await getPlatformForecastSummary();
  if (!summary.groups.length) {
    return NoContent();
  }

  const buffer = await buildPlatformForecastWorkbookBuffer(summary);
  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': contentDispositionAttachment('public-cloud-forecast.xlsx'),
    },
  });
});
