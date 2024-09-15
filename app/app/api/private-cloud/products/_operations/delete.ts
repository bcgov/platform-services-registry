import { RequestType, DecisionStatus, ProjectStatus, EventType } from '@prisma/client';
import { Session } from 'next-auth';
import { z, TypeOf, ZodType } from 'zod';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { isEligibleForDeletion } from '@/helpers/openshift';
import { createEvent } from '@/mutations/events';
import { getPrivateCloudProduct, excludeProductUsers } from '@/queries/private-cloud-products';
import { getLastClosedPrivateCloudRequest, privateCloudRequestDetailInclude } from '@/queries/private-cloud-requests';
import { sendDeleteRequestEmails } from '@/services/ches/private-cloud';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';
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

  const product = excludeProductUsers(await getPrivateCloudProduct(session, licencePlate));

  if (!product?._permissions.delete) {
    return UnauthorizedResponse();
  }

  const canDelete = await isEligibleForDeletion(product.licencePlate, product.cluster);
  if (!canDelete) {
    return BadRequestResponse(
      'this project is not deletable as it is not empty. Please delete all resources before deleting the project.',
    );
  }

  const { id, requests, updatedAt, _permissions, temporaryProductNotificationDate, ...rest } = product;

  // Retrieve the latest request data to acquire the decision data ID that can be assigned to the incoming request's original data.
  const previousRequest = await getLastClosedPrivateCloudRequest(rest.licencePlate);

  const productData = { ...rest, status: ProjectStatus.INACTIVE };
  const request: PrivateCloudRequestDetail = await prisma.privateCloudRequest.create({
    data: {
      type: RequestType.DELETE,
      decisionStatus: DecisionStatus.PENDING,
      active: true,
      createdBy: { connect: { email: user.email } },
      licencePlate: product.licencePlate,
      originalData: { connect: { id: previousRequest?.decisionDataId } },
      decisionData: { create: productData },
      requestData: { create: productData },
      project: {
        connect: {
          licencePlate,
        },
      },
    },
    include: privateCloudRequestDetailInclude,
  });

  if (request) {
    await Promise.all([
      createEvent(EventType.DELETE_PRIVATE_CLOUD_PRODUCT, session.user.id, { requestId: request.id }),
      sendDeleteRequestEmails(request, session.user.name),
    ]);
  }

  return OkResponse(request);
}
