import { RequestType } from '@prisma/client';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse } from '@/core/responses';
import createPrivateCloudNatsMessage from '@/services/nats/private-cloud';

const pathParamSchema = z.object({
  idOrLicencePlate: z.string().min(6),
});

const apiHandler = createApiHandler({
  keycloakOauth2: {
    clientId: 'registry-gitops-ci',
  },
  validations: { pathParams: pathParamSchema },
});
export const GET = apiHandler(async ({ pathParams, session }) => {
  const { idOrLicencePlate } = pathParams;

  const where = idOrLicencePlate.length > 7 ? { id: idOrLicencePlate } : { licencePlate: idOrLicencePlate };

  const product = await prisma.privateCloudProject.findUnique({
    where,
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
    },
  });

  if (!product) {
    return BadRequestResponse(`there is no products associated with key '${idOrLicencePlate}'`);
  }

  const result = await createPrivateCloudNatsMessage(
    { id: product.id, type: RequestType.EDIT, decisionData: product },
    false,
  );

  return OkResponse(result);
});
