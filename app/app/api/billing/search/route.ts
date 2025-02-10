import { DecisionStatus, RequestType } from '@prisma/client';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { OkResponse } from '@/core/responses';
import { searchBilling } from '@/services/db/billing';
import { BillingSearchResponsePayload } from '@/types/billing';
import { billingSearchBodySchema } from '@/validation-schemas/billing';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewBilling],
  validations: { body: billingSearchBodySchema },
})(async ({ body }) => {
  const { data, totalCount } = await searchBilling(body);

  const billingIds = data.map(({ id }) => id);

  const [publicProducts, publicCreateRequests] = await Promise.all([
    prisma.publicCloudProject.findMany({
      where: { billingId: { in: billingIds } },
      select: { id: true, licencePlate: true, name: true, billingId: true, provider: true },
    }),
    prisma.publicCloudRequest.findMany({
      where: {
        type: RequestType.CREATE,
        decisionStatus: DecisionStatus.PENDING,
        decisionData: { billingId: { in: billingIds } },
      },
      select: {
        id: true,
        licencePlate: true,
        decisionData: { select: { name: true, billingId: true, provider: true } },
      },
    }),
  ]);

  const result: BillingSearchResponsePayload = {
    data,
    totalCount,
    metadata: {
      publicProducts: publicProducts.map(({ id, licencePlate, name, provider, billingId }) => ({
        type: 'product',
        url: `/public-cloud/products/${licencePlate}/edit`,
        id,
        licencePlate,
        name,
        context: provider,
        billingId,
      })),
      publicRequests: publicCreateRequests.map(({ id, licencePlate, decisionData }) => ({
        type: 'request',
        url: `/public-cloud/requests/${id}/request`,
        id,
        licencePlate,
        name: decisionData.name,
        context: decisionData.provider,
        billingId: decisionData.billingId,
      })),
    },
  };

  return OkResponse(result);
});
