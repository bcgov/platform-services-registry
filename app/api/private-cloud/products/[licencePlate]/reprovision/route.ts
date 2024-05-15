import { $Enums } from '@prisma/client';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { getPrivateCloudProduct } from '@/queries/private-cloud-products';
import { sendPrivateCloudNatsMessage } from '@/services/nats';

const pathParamSchema = z.object({
  licencePlate: z.string().min(1),
});

const apiHandler = createApiHandler({
  roles: ['admin', 'private-admin'],
  validations: { pathParams: pathParamSchema },
});
export const GET = apiHandler(async ({ pathParams, session }) => {
  const { licencePlate } = pathParams;

  const product = await getPrivateCloudProduct(session, licencePlate);

  if (!product?._permissions.reprovision) {
    return UnauthorizedResponse();
  }

  const msgId = `reprovision-${new Date().getTime()}`;

  await sendPrivateCloudNatsMessage(msgId, $Enums.RequestType.EDIT, product, false);

  // For GOLD requests, we create an identical request for GOLDDR
  if (product.cluster === $Enums.Cluster.GOLD && product.golddrEnabled) {
    await sendPrivateCloudNatsMessage(
      msgId,
      $Enums.RequestType.EDIT,
      { ...product, cluster: $Enums.Cluster.GOLDDR },
      false,
    );
  }

  return OkResponse(true);
});
