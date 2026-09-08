import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { CsvResponse, NoContent, UnauthorizedResponse } from '@/core/responses';
import {
  buildFinanceExportCsvRows,
  buildFinanceWorkbookBuffer,
  contentDispositionAttachment,
} from '@/helpers/finance-export';
import type { ProviderFilter } from '@/services/db/public-cloud-finance';
import { financeExportQuerySchema } from '@/validation-schemas/cloud-cost';

export const GET = createApiHandler({
  permissions: [GlobalPermissions.ViewPublicCloudForecast],
  validations: { queryParams: financeExportQuerySchema },
})(async ({ queryParams, session }) => {
  if (!session.previews.publicCloudFinance) {
    return UnauthorizedResponse();
  }

  const provider = queryParams.provider as ProviderFilter;
  const period = queryParams.period;
  const datasets = queryParams.datasets
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean);
  const format = queryParams.format ?? 'xlsx';

  if (format === 'csv') {
    const rows = await buildFinanceExportCsvRows({ provider, period, datasets });
    if (!rows.length) return NoContent();
    return CsvResponse(rows, 'public-cloud-finance.csv');
  }

  const buffer = await buildFinanceWorkbookBuffer({ provider, period, datasets });
  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': contentDispositionAttachment('public-cloud-finance.xlsx'),
    },
  });
});
