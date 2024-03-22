import { $Enums } from '@prisma/client';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { sendPrivateCloudNatsMessage } from '@/services/nats';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import prisma from '@/core/prisma';

const pathParamSchema = z.object({
  licencePlate: z.string().min(1),
});

const apiHandler = createApiHandler({
  roles: ['admin'],
  validations: { pathParams: pathParamSchema },
});
export const GET = apiHandler(async ({ pathParams, session }) => {
  const { licencePlate } = pathParams;

  const product = await prisma.privateCloudProject.findFirst({
    where: { licencePlate, status: $Enums.ProjectStatus.ACTIVE },
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
    },
  });

  if (!product) {
    return BadRequestResponse(`there is no products associated with licencePlate '${licencePlate}'`);
  }

  await sendPrivateCloudNatsMessage('reprovision', $Enums.RequestType.EDIT, product, false);

  // For GOLD requests, we create an identical request for GOLDDR
  if (product.cluster === $Enums.Cluster.GOLD) {
    await sendPrivateCloudNatsMessage(
      'reprovision',
      $Enums.RequestType.EDIT,
      { ...product, cluster: $Enums.Cluster.GOLDDR },
      false,
    );
  }

  return OkResponse(true);
});
