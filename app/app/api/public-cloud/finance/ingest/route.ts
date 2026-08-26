import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
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
  if (!session.isServiceAccount && !session.previews.publicCloudFinance) {
    return UnauthorizedResponse();
  }

  const defaultSource = defaultFinanceBillingSource();
  if (body.useSimulated === true && defaultSource === 'real') {
    return BadRequestResponse('Simulated ingest is not allowed when the billing source is real');
  }
  const useSimulated = body.useSimulated ?? defaultSource === 'simulated';
  if (body.provider === Provider.AWS && !useSimulated) {
    return BadRequestResponse('Classic AWS ingest is not supported for real billing data. Use AWS_LZA.');
  }
  const triggeredBy = session.isServiceAccount
    ? 'finance-ingest-sa'
    : session.user?.email || session.userIdirGuid || 'api';

  try {
    const result = await ingestBillingPeriod({
      provider: body.provider as Provider,
      period: { year: body.year, month: body.month },
      triggeredBy,
      source: useSimulated ? createSimulatedBillingSource() : undefined,
      scope: body.licencePlates?.length ? { licencePlates: body.licencePlates } : undefined,
    });
    return OkResponse(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ingest failed';
    return BadRequestResponse(message);
  }
});
