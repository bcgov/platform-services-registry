import { lastCompleteMonth } from '@/components/public-cloud/finance/finance-measure-utils';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { defaultFinanceBillingSource } from '@/services/public-cloud-finance/constants';
import { listScheduledIngestPlan } from '@/services/public-cloud-finance/ingest/missing-periods';
import { financeIngestMissingQuerySchema } from '@/validation-schemas/cloud-cost';

export const GET = createApiHandler({
  roles: [`${GlobalRole.ServiceAccount} ${GlobalRole.PublicAdmin}`, GlobalRole.Admin, GlobalRole.PublicAdmin],
  useServiceAccount: true,
  validations: { queryParams: financeIngestMissingQuerySchema },
})(async ({ queryParams, session }) => {
  const allowWithoutPreview = defaultFinanceBillingSource() === 'real';
  if (!session.isServiceAccount && !session.previews.publicCloudFinance && !allowWithoutPreview) {
    return UnauthorizedResponse();
  }

  const through =
    queryParams.year && queryParams.month ? { year: queryParams.year, month: queryParams.month } : lastCompleteMonth();

  return OkResponse(await listScheduledIngestPlan(through));
});
