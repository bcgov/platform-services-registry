import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { Provider } from '@/prisma/client';
import { defaultFinanceBillingSource } from '@/services/public-cloud-finance/constants';
import { ingestBillingPeriod } from '@/services/public-cloud-finance/ingest/run-ingest';
import { createSimulatedBillingSource } from '@/services/public-cloud-finance/ingest/simulated-source';
import { financeIngestBodySchema } from '@/validation-schemas/cloud-cost';

/**
 * Internal ingest trigger for Airflow (test/prod) and local tooling.
 * Local/Dev default to simulated unless useSimulated is explicitly false.
 */
export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewPublicCloudForecast],
  validations: { body: financeIngestBodySchema },
})(async ({ body, session }) => {
  const allowWithoutPreview = defaultFinanceBillingSource() === 'real';
  if (!session.previews.publicCloudFinance && !allowWithoutPreview) {
    return UnauthorizedResponse();
  }

  const useSimulated = body.useSimulated ?? defaultFinanceBillingSource() === 'simulated';
  const result = await ingestBillingPeriod({
    provider: body.provider as Provider,
    period: { year: body.year, month: body.month },
    triggeredBy: session.user?.email || session.userIdirGuid || 'api',
    source: useSimulated ? createSimulatedBillingSource() : undefined,
    scope: body.licencePlates?.length ? { licencePlates: body.licencePlates } : undefined,
  });

  return OkResponse(result);
});
