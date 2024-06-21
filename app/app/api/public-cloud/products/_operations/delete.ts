import { $Enums } from '@prisma/client';
import { Session } from 'next-auth';
import { z, TypeOf, ZodType } from 'zod';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { createEvent } from '@/mutations/events';
import { getPublicCloudProduct, excludeProductUsers } from '@/queries/public-cloud-products';
import { getLastClosedPublicCloudRequest } from '@/queries/public-cloud-requests';
import { sendDeleteRequestEmails, sendAdminDeleteRequestEmails } from '@/services/ches/public-cloud/email-handler';
import { sendPublicCloudNatsMessage } from '@/services/nats';
import { deletePathParamSchema } from '../[licencePlate]/schema';

export default async function deleteOp({
  session,
  pathParams,
}: {
  session: Session;
  pathParams: TypeOf<typeof deletePathParamSchema>;
}) {
  const { user } = session;
  const { licencePlate } = pathParams;

  const product = excludeProductUsers(await getPublicCloudProduct(session, licencePlate));

  if (!product?._permissions.delete) {
    return UnauthorizedResponse();
  }

  const { id, requests, updatedAt, _permissions, ...rest } = product;

  // Retrieve the latest request data to acquire the decision data ID that can be assigned to the incoming request's original data.
  const previousRequest = await getLastClosedPublicCloudRequest(rest.licencePlate);

  const request = await prisma.publicCloudRequest.create({
    data: {
      type: $Enums.PublicCloudRequestType.DELETE,
      decisionStatus: $Enums.DecisionStatus.PENDING,
      active: true,
      createdByEmail: user.email,
      licencePlate: product.licencePlate,
      originalData: {
        connect: {
          id: previousRequest?.decisionDataId,
        },
      },
      decisionData: {
        create: { ...rest, status: $Enums.ProjectStatus.INACTIVE },
      },
      requestData: {
        create: { ...rest, status: $Enums.ProjectStatus.INACTIVE },
      },
      project: {
        connect: {
          licencePlate,
        },
      },
    },
    include: {
      originalData: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
          expenseAuthority: true,
        },
      },
      decisionData: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
          expenseAuthority: true,
        },
      },
      project: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
          expenseAuthority: true,
        },
      },
    },
  });

  if (request) {
    await Promise.all([
      sendDeleteRequestEmails(request.decisionData, session.user.name),
      sendAdminDeleteRequestEmails(request.decisionData, session.user.name),
      createEvent($Enums.EventType.DELETE_PUBLIC_CLOUD_PRODUCT, session.user.id, { requestId: request.id }),
    ]);
  }

  return OkResponse(request);
}
