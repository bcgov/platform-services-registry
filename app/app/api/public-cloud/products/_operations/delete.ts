import { PublicCloudRequestType, DecisionStatus, ProjectStatus, EventType } from '@prisma/client';
import { Session } from 'next-auth';
import { z, TypeOf, ZodType } from 'zod';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { createEvent } from '@/mutations/events';
import { getPublicCloudProduct, excludeProductUsers } from '@/queries/public-cloud-products';
import { getLastClosedPublicCloudRequest, publicCloudRequestDetailInclude } from '@/queries/public-cloud-requests';
import { sendDeleteRequestEmails } from '@/services/ches/public-cloud/email-handler';
import { PublicCloudRequestDetail } from '@/types/public-cloud';
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

  const productData = { ...rest, status: ProjectStatus.INACTIVE };
  const request: PublicCloudRequestDetail | null = await prisma.publicCloudRequest.create({
    data: {
      type: PublicCloudRequestType.DELETE,
      decisionStatus: DecisionStatus.PENDING,
      active: true,
      createdBy: { connect: { email: user.email } },
      licencePlate: product.licencePlate,
      originalData: { connect: { id: previousRequest?.decisionDataId } },
      decisionData: { create: productData },
      requestData: { create: productData },
      project: { connect: { licencePlate } },
    },
    include: publicCloudRequestDetailInclude,
  });

  if (request) {
    await Promise.all([
      sendDeleteRequestEmails(request, session.user.name),
      createEvent(EventType.DELETE_PUBLIC_CLOUD_PRODUCT, session.user.id, { requestId: request.id }),
    ]);
  }

  return OkResponse(request);
}
