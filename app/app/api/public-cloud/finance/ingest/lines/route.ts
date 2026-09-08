import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import {
  BadRequestResponse,
  ConflictResponse,
  InternalServerErrorResponse,
  OkResponse,
  UnauthorizedResponse,
} from '@/core/responses';
import {
  ingestFailureMessage,
  isClientIngestError,
  isIngestAlreadyRunningError,
} from '@/services/public-cloud-finance/ingest/ingest-errors';
import { persistBillingPeriod } from '@/services/public-cloud-finance/ingest/persist-billing-period';
import { financeIngestLinesBodySchema } from '@/validation-schemas/cloud-cost';

/**
 * Persist Airflow-fetched Azure / AWS LZA billing lines.
 * The registry does not call Cost Explorer or Cost Management.
 */
export const POST = createApiHandler({
  roles: [`${GlobalRole.ServiceAccount} ${GlobalRole.PublicAdmin}`, GlobalRole.Admin, GlobalRole.PublicAdmin],
  useServiceAccount: true,
  validations: { body: financeIngestLinesBodySchema },
})(async ({ body, session }) => {
  if (!session.isServiceAccount && !session.previews.publicCloudFinance) {
    return UnauthorizedResponse();
  }

  const triggeredBy = session.isServiceAccount
    ? 'finance-ingest-sa'
    : session.user?.email || session.userIdirGuid || 'api';

  try {
    const result = await persistBillingPeriod({
      provider: body.provider,
      period: { year: body.year, month: body.month },
      triggeredBy,
      lines: body.lines,
    });
    return OkResponse(result);
  } catch (error) {
    const message = ingestFailureMessage(error);
    if (isIngestAlreadyRunningError(error)) return ConflictResponse(message);
    if (isClientIngestError(error)) return BadRequestResponse(message);
    return InternalServerErrorResponse(message);
  }
});
