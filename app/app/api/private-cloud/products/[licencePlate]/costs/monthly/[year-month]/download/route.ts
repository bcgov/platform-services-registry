import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NoContent, PdfResponse } from '@/core/responses';
import { generateMonthlyCostPdf } from '@/helpers/pdfs/monthly-cost';
import { getMonthlyCosts } from '@/services/db/private-cloud-costs';
import { formatDateSimple } from '@/utils/js';

const pathParamSchema = z.object({
  licencePlate: z.string(),
  'year-month': z.string(),
});

export const POST = createApiHandler({
  roles: [GlobalRole.User],
  validations: {
    pathParams: pathParamSchema,
  },
})(async ({ pathParams, session }) => {
  const { licencePlate, 'year-month': yearMonth } = pathParams;
  const [year, month] = yearMonth.split('-').map(Number);

  const monthlyData = await getMonthlyCosts(licencePlate, year, month);

  if (!monthlyData || !monthlyData.items || monthlyData.items.length === 0) {
    return NoContent();
  }

  const formattedItems = monthlyData.items.map((item) => ({
    startDate: formatDateSimple(item.startDate),
    endDate: formatDateSimple(item.endDate),
    cpuCores: item.cpu,
    storageGiB: item.storage,
    cpuCost: item.cpuCost.toFixed(2),
    storageCost: item.storageCost.toFixed(2),
    totalCost: item.totalCost.toFixed(2),
  }));

  const accountCodingString = monthlyData.accountCoding;

  const pdfBuffer = await generateMonthlyCostPdf(
    formattedItems,
    yearMonth,
    accountCodingString,
    monthlyData.currentTotal,
    monthlyData.estimatedGrandTotal,
    monthlyData.grandTotal,
  );
  return PdfResponse(pdfBuffer, `monthly-costs-${yearMonth}.pdf`);
});
