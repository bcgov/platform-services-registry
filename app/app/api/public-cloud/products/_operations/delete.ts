import { PublicCloudRequestType, DecisionStatus, ProjectStatus, EventType } from '@prisma/client';
import { Session } from 'next-auth';
import { z, TypeOf, ZodType } from 'zod';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { sendDeleteRequestEmails } from '@/services/ches/public-cloud';
import {
  createEvent,
  models,
  publicCloudRequestDetailInclude,
  excludePublicProductPopulatedFields,
  getLastClosedPublicCloudRequest,
} from '@/services/db';
import { deletePathParamSchema } from '../[licencePlate]/schema';

export default async function deleteOp({
  session,
  pathParams,
}: {
  session: Session;
  pathParams: TypeOf<typeof deletePathParamSchema>;
}) {
  const { licencePlate } = pathParams;

  const product = excludePublicProductPopulatedFields(
    (await models.publicCloudProduct.get({ where: { licencePlate } }, session)).data,
  );

  if (!product?._permissions.delete) {
    return UnauthorizedResponse();
  }

  const { id, requests, updatedAt, _permissions, ...rest } = product;

  // Retrieve the latest request data to acquire the decision data ID that can be assigned to the incoming request's original data.
  const previousRequest = await getLastClosedPublicCloudRequest(rest.licencePlate);

  const productData = { ...rest, status: ProjectStatus.INACTIVE };
  const newRequest = await prisma.publicCloudRequest.create({
    data: {
      type: PublicCloudRequestType.DELETE,
      decisionStatus: DecisionStatus.PENDING,
      active: true,
      createdBy: { connect: { email: session.user.email } },
      licencePlate: product.licencePlate,
      originalData: { connect: { id: previousRequest?.decisionDataId } },
      requestData: { create: productData },
      decisionData: { create: productData },
      project: { connect: { licencePlate } },
    },
    include: publicCloudRequestDetailInclude,
  });

  await Promise.all([
    createEvent(EventType.DELETE_PUBLIC_CLOUD_PRODUCT, session.user.id, { requestId: newRequest.id }),
    sendDeleteRequestEmails(newRequest, session.user.name),
  ]);

  return OkResponse(newRequest);
}
