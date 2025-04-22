import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import { RequestType, Cluster, EventType } from '@/prisma/types';
import { createEvent, models } from '@/services/db';
import { sendPrivateCloudNatsMessage } from '@/services/nats';

const pathParamSchema = z.object({
  licencePlate: z.string().min(1),
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.Admin, GlobalRole.PrivateAdmin],
  validations: { pathParams: pathParamSchema },
});
export const GET = apiHandler(async ({ pathParams, session }) => {
  const { licencePlate } = pathParams;

  const { data: product } = await models.privateCloudProduct.get({ where: { licencePlate } }, session);

  if (!product?._permissions.reprovision) {
    return UnauthorizedResponse();
  }

  const msgId = `reprovision-${new Date().getTime()}`;

  await sendPrivateCloudNatsMessage(
    {
      id: msgId,
      type: RequestType.EDIT,
      decisionData: product,
    },
    false,
  );

  // For GOLD requests, we create an identical request for GOLDDR
  if (product.cluster === Cluster.GOLD && product.golddrEnabled) {
    await sendPrivateCloudNatsMessage(
      {
        id: msgId,
        type: RequestType.EDIT,
        decisionData: { ...product, cluster: Cluster.GOLDDR },
      },
      false,
    );
  }

  await createEvent(EventType.REPROVISION_PRIVATE_CLOUD_PRODUCT, session.user.id, {
    licencePlate: product.licencePlate,
  });

  return OkResponse(true);
});
