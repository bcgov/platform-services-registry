import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { PdfResponse } from '@/core/responses';
import { generateYearlyCostHistoryPDF } from '@/helpers/pdfs/yearly-cost';
import { getTransformedCostData } from '@/helpers/product';
import { getPrivateCloudProductYearlyCostHistory } from '@/services/backend/private-cloud/products';

const pathParamSchema = z.object({
  licencePlate: z.string(),
  year: z.string(),
});

export const POST = createApiHandler({
  roles: [GlobalRole.User],
  validations: {
    pathParams: pathParamSchema,
  },
})(async ({ pathParams, session }) => {
  const { licencePlate, year } = pathParams;

  const data = await getPrivateCloudProductYearlyCostHistory(licencePlate, year);
  const transformedData = getTransformedCostData(data.items);

  const pdfBuffer = await generateYearlyCostHistoryPDF(transformedData, year);
  return PdfResponse(pdfBuffer, `cost-history-for-${year}.pdf`);
});
