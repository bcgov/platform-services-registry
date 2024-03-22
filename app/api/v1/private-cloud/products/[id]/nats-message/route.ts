import { $Enums } from '@prisma/client';
import prisma from '@/core/prisma';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import createPrivateCloudNatsMessage from '@/services/nats/private-cloud';
import { BadRequestResponse, OkResponse } from '@/core/responses';

const pathParamSchema = z.object({
  id: z.string().min(1),
});

const apiHandler = createApiHandler({
  keycloakOauth2: {
    clientId: 'registry-gitops-ci',
  },
  validations: { pathParams: pathParamSchema },
});
export const GET = apiHandler(async ({ pathParams, session }) => {
  const { id } = pathParams;

  const product = await prisma.privateCloudProject.findUnique({
    where: {
      id,
    },
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
    },
  });

  if (!product) {
    return BadRequestResponse(`there is no products associated with ID '${id}'`);
  }

  const result = await createPrivateCloudNatsMessage(product.id, $Enums.RequestType.EDIT, product, false);

  return OkResponse(result);
});
