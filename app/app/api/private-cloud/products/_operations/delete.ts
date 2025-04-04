import { RequestType, DecisionStatus, ProjectStatus, EventType, Prisma, TaskType } from '@prisma/client';
import { Session } from 'next-auth';
import { z, TypeOf, ZodType } from 'zod';
import { BadRequestResponse, OkResponse, UnauthorizedResponse, UnprocessableEntityResponse } from '@/core/responses';
import { sendDeleteRequestEmails } from '@/services/ches/private-cloud';
import {
  createEvent,
  privateCloudRequestDetailInclude,
  models,
  excludePrivateProductPopulatedFields,
  getLastClosedPrivateCloudRequest,
  tasks,
} from '@/services/db';
import { isEligibleForDeletion } from '@/services/k8s/reads';
import { deletePathParamSchema } from '../[licencePlate]/schema';

export default async function deleteOp({
  session,
  pathParams,
}: {
  session: Session;
  pathParams: TypeOf<typeof deletePathParamSchema>;
}) {
  const { licencePlate } = pathParams;

  const product = excludePrivateProductPopulatedFields(
    (await models.privateCloudProduct.get({ where: { licencePlate } }, session)).data,
  );

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
  const requestCreateData: Prisma.PrivateCloudRequestCreateInput = {
    type: RequestType.DELETE,
    decisionStatus: DecisionStatus.PENDING,
    active: true,
    licencePlate: product.licencePlate,
    originalData: { connect: { id: previousRequest?.decisionDataId } },
    decisionData: { create: productData },
    requestData: { create: productData },
    project: {
      connect: {
        licencePlate,
      },
    },
  };

  if (!session.isServiceAccount) {
    requestCreateData.createdBy = { connect: { email: session.user.email } };
  }

  const newRequest = (
    await models.privateCloudRequest.create(
      {
        data: requestCreateData,
        include: privateCloudRequestDetailInclude,
      },
      session,
    )
  ).data;

  await Promise.all([
    createEvent(EventType.DELETE_PRIVATE_CLOUD_PRODUCT, session.user.id, { requestId: newRequest.id }),
    tasks.create(TaskType.REVIEW_PRIVATE_CLOUD_REQUEST, { request: newRequest, requester: session.user.name }),
    sendDeleteRequestEmails(newRequest, session.user.name),
  ]);

  return OkResponse(newRequest);
}
