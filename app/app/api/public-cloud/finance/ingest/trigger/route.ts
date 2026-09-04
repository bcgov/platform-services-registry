import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { BadRequestResponse, InternalServerErrorResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { ingestFailureMessage, isClientIngestError } from '@/services/public-cloud-finance/ingest/ingest-errors';
import { triggerFinanceIngestDag } from '@/services/public-cloud-finance/ingest/trigger-airflow-dag';

/**
 * Queue the environment finance DAG (local, dev, test, and prod).
 * Airflow fetches Azure / AWS LZA billing; the registry only persists the lines.
 */
export const POST = createApiHandler({
  roles: [`${GlobalRole.ServiceAccount} ${GlobalRole.PublicAdmin}`, GlobalRole.Admin, GlobalRole.PublicAdmin],
  useServiceAccount: true,
})(async ({ session }) => {
  if (!session.isServiceAccount && !session.previews.publicCloudFinance) {
    return UnauthorizedResponse();
  }

  const triggeredBy = session.isServiceAccount
    ? 'finance-ingest-sa'
    : session.user?.email || session.userIdirGuid || 'api';

  try {
    const result = await triggerFinanceIngestDag({ triggeredBy });
    return OkResponse({ queued: true, ...result });
  } catch (error) {
    const message = ingestFailureMessage(error);
    if (isClientIngestError(error)) return BadRequestResponse(message);
    return InternalServerErrorResponse(message);
  }
});
