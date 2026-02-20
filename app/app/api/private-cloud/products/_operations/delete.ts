import { Session } from 'next-auth';
import { TypeOf } from 'zod';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { sendRequestNatsMessage } from '@/helpers/nats-message';
import { DecisionStatus, EventType, Prisma, ProjectStatus, RequestType, TaskType } from '@/prisma/client';
import { sendDeleteRequestEmails, sendRequestApprovalEmails } from '@/services/ches/private-cloud';
import {
  createEvent,
  privateCloudRequestDetailInclude,
  models,
  excludePrivateProductPopulatedFields,
  getLastEffectivePrivateCloudRequest,
  tasks,
} from '@/services/db';
import { isEligibleForDeletion } from '@/services/k8s/reads';
import { Comment } from '@/validation-schemas/shared';
import { deletePathParamSchema } from '../[licencePlate]/schema';

export default async function deleteOp({
  session,
  requestComment,
  pathParams,
}: {
  session: Session;
  requestComment: Comment;
  pathParams: TypeOf<typeof deletePathParamSchema>;
}) {
  const { licencePlate } = pathParams;

  const product = excludePrivateProductPopulatedFields(
    (await models.privateCloudProduct.get({ where: { licencePlate } }, session)).data,
  );

  if (!product?._permissions.delete) {
    return UnauthorizedResponse();
  }

  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const isOldTestProduct = product.isTest && Date.now() - product.createdAt.getTime() > THIRTY_DAYS_MS;

  const canDelete = isOldTestProduct || (await isEligibleForDeletion(product.licencePlate, product.cluster));

  if (!canDelete) {
    return BadRequestResponse(
      'this project is not deletable as it is not empty. Please delete all resources before deleting the project.',
    );
  }

  const { id, requests, updatedAt, _permissions, temporaryProductNotificationDate, archivedAt, ...rest } = product;

  // Retrieve the latest request data to acquire the decision data ID that can be assigned to the incoming request's original data.
  const previousRequest = await getLastEffectivePrivateCloudRequest(rest.licencePlate);

  const productData = { ...rest, status: ProjectStatus.INACTIVE };
  const decisionStatus = product.isTest ? DecisionStatus.AUTO_APPROVED : DecisionStatus.PENDING;
  const decisionDate = decisionStatus === DecisionStatus.AUTO_APPROVED ? new Date() : null;

  const requestCreateData: Prisma.PrivateCloudRequestCreateInput = {
    type: RequestType.DELETE,
    decisionStatus,
    decisionDate,
    active: true,
    requestComment,
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

  const proms: Promise<unknown>[] = [];

  const push = (p?: Promise<unknown> | void | null) => {
    if (p) proms.push(p);
  };

  if (!session.isServiceAccount && session.user?.id) {
    push(createEvent(EventType.DELETE_PRIVATE_CLOUD_PRODUCT, session.user.id, { requestId: newRequest.id }));
  }

  const actorName = session.isServiceAccount ? 'Automation' : session.user?.name ?? 'Unknown';

  if (decisionStatus === DecisionStatus.AUTO_APPROVED) {
    push(
      sendRequestNatsMessage(newRequest, {
        projectOwner: { email: newRequest.originalData?.projectOwner.email },
        primaryTechnicalLead: { email: newRequest.originalData?.primaryTechnicalLead.email },
        secondaryTechnicalLead: { email: newRequest.originalData?.secondaryTechnicalLead?.email },
      }),
    );
    push(sendRequestApprovalEmails(newRequest, actorName));
  } else {
    push(
      tasks.create(TaskType.REVIEW_PRIVATE_CLOUD_REQUEST, {
        request: newRequest,
        requester: actorName,
      }),
    );

    push(sendDeleteRequestEmails(newRequest, actorName));
  }

  await Promise.all(proms);

  return OkResponse(newRequest);
}
