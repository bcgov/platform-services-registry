import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { UnauthorizedResponse, PdfResponse } from '@/core/responses';
import { generateQuarterlyCostPdf } from '@/helpers/pdfs/quarterly-cost';
import { models } from '@/services/db';
import { getQuarterlyCosts } from '@/services/db/private-cloud-costs';

const pathParamSchema = z.object({
  licencePlate: z.string(),
  'year-quarter': z.string(),
});

export const POST = createApiHandler({
  roles: [GlobalRole.User],
  validations: {
    pathParams: pathParamSchema,
  },
})(async ({ pathParams, session }) => {
  const { licencePlate, 'year-quarter': yearQuarter } = pathParams;
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

  const [year, quarter] = yearQuarter.split('-').map(Number);
  const result = await getQuarterlyCosts(licencePlate, year, quarter);
  const selectedDate = result.startDate;

  const pdfBuffer = await generateQuarterlyCostPdf({ product, data: result, selectedDate });
  return PdfResponse(pdfBuffer, `quarterly-costs-${year}-Q${quarter}.pdf`);
});
