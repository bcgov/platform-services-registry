import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { UnauthorizedResponse, PdfResponse } from '@/core/responses';
import { generateMonthlyCostPdf } from '@/helpers/pdfs/monthly-cost';
import { models } from '@/services/db';
import { getMonthlyCosts } from '@/services/db/private-cloud-costs';

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
  const { data: product } = await models.privateCloudProduct.get(
    {
      where: {
        licencePlate,
      },
    },
    session,
  );

  if (!product?._permissions.view) {
    return UnauthorizedResponse();
  }

  const [year, month] = yearMonth.split('-').map(Number);
  const monthlyData = await getMonthlyCosts(licencePlate, year, month);
  const selectedDate = monthlyData.startDate;

  const pdfBuffer = await generateMonthlyCostPdf({ product, data: monthlyData, selectedDate });
  return PdfResponse(pdfBuffer, `monthly-costs-${yearMonth}.pdf`);
});
