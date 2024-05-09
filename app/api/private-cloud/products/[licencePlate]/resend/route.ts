import { $Enums, Cluster } from '@prisma/client';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { sendPrivateCloudNatsMessage } from '@/services/nats';
import { PrivateCloudProjectDecorate } from '@/types/doc-decorate';
import { BadRequestResponse, OkResponse } from '@/core/responses';
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
      requests: {
        where: {
          active: true,
          decisionStatus: $Enums.DecisionStatus.APPROVED,
        },
        include: {
          requestedProject: {
            include: {
              projectOwner: true,
              primaryTechnicalLead: true,
              secondaryTechnicalLead: true,
            },
          },
        },
      },
    },
    session: session as never,
  });

  const projectWithPermissions = product as typeof product & PrivateCloudProjectDecorate;

  if (!projectWithPermissions._permissions.resend || !product?.requests || product.requests.length === 0) {
    return BadRequestResponse(
      `there is no provisioning request for the product with the license plate '${licencePlate}'.`,
    );
  }

  const request = product.requests[0];

  const contactsChanged =
    product.projectOwner.email.toLowerCase() !== request.requestedProject.projectOwner.email.toLowerCase() ||
    product.primaryTechnicalLead.email.toLowerCase() !==
      request.requestedProject.primaryTechnicalLead.email.toLowerCase() ||
    product.secondaryTechnicalLead?.email.toLowerCase() !==
      request.requestedProject?.secondaryTechnicalLead?.email.toLowerCase();

  const msgId = `resend-${new Date().getTime()}`;

  await sendPrivateCloudNatsMessage(msgId, request.type, request.requestedProject, contactsChanged);

  // For GOLD requests, we create an identical request for GOLDDR
  if (request.requestedProject.cluster === Cluster.GOLD && request.requestedProject.golddrEnabled) {
    await sendPrivateCloudNatsMessage(
      msgId,
      request.type,
      { ...request.requestedProject, cluster: Cluster.GOLDDR },
      contactsChanged,
    );
  }

  return OkResponse(true);
});
