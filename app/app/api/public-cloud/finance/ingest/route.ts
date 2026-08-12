import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { Provider } from '@/prisma/client';
import { defaultFinanceBillingSource } from '@/services/public-cloud-finance/constants';
import { ingestBillingPeriod } from '@/services/public-cloud-finance/ingest/run-ingest';
import { createSimulatedBillingSource } from '@/services/public-cloud-finance/ingest/simulated-source';
import { financeIngestBodySchema } from '@/validation-schemas/cloud-cost';

/**
 * Internal ingest trigger for Airflow (test/prod) and local tooling.
 * Airflow authenticates with a Keycloak team service account (public-admin),
 * matching the public-cloud provisioner pattern.
 * Local/Dev default to simulated unless useSimulated is explicitly false.
 */
export const POST = createApiHandler({
  roles: [`${GlobalRole.ServiceAccount} ${GlobalRole.PublicAdmin}`, GlobalRole.Admin, GlobalRole.PublicAdmin],
  useServiceAccount: true,
  validations: { body: financeIngestBodySchema },
})(async ({ body, session }) => {
  const allowWithoutPreview = defaultFinanceBillingSource() === 'real';
  if (!session.isServiceAccount && !session.previews.publicCloudFinance && !allowWithoutPreview) {
    return UnauthorizedResponse();
  }

  const useSimulated = body.useSimulated ?? defaultFinanceBillingSource() === 'simulated';
  const triggeredBy = session.isServiceAccount
    ? 'finance-ingest-sa'
    : session.user?.email || session.userIdirGuid || 'api';

  const result = await ingestBillingPeriod({
    provider: body.provider as Provider,
    period: { year: body.year, month: body.month },
    triggeredBy,
    source: useSimulated ? createSimulatedBillingSource() : undefined,
    scope: body.licencePlates?.length ? { licencePlates: body.licencePlates } : undefined,
  });

  return OkResponse(result);
});
