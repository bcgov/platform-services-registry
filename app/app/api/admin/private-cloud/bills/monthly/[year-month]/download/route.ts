import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { UnauthorizedResponse, PdfResponse, OkResponse } from '@/core/responses';
import { generateAdminMonthylCostPdf } from '@/helpers/pdfs/admin-monthly-cost';
import { getAdminMonthlyCosts, getYearlyCosts } from '@/services/db/private-cloud-costs';

const pathParamSchema = z.object({
  'year-month': z.string(),
});

const bodySchema = z.object({
  totalCost: z.number(),
});

export const POST = createApiHandler({
  roles: [GlobalRole.Admin, GlobalRole.BillingManager, GlobalRole.Billingreader],
  validations: {
    pathParams: pathParamSchema,
    body: bodySchema,
  },
})(async ({ pathParams, body }) => {
  const { 'year-month': yearMonth } = pathParams;

  const [year, month] = yearMonth.split('-').map(Number);

  const { items, totalCount } = await getAdminMonthlyCosts(year, month);

  const pdfBuffer = await generateAdminMonthylCostPdf({
    data: items,
    totalCost: body.totalCost,
    totalCount,
    yearMonth,
  });
  return PdfResponse(pdfBuffer, `admin-monthly-costs-${yearMonth}.pdf`);
});
