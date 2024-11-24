import { DecisionStatus, Cluster, RequestType, EventType, TaskType } from '@prisma/client';
import { Session } from 'next-auth';
import { TypeOf } from 'zod';
import { OkResponse, UnauthorizedResponse, UnprocessableEntityResponse } from '@/core/responses';
import { getQuotaChangeStatus } from '@/helpers/auto-approval-check';
import { sendRequestNatsMessage } from '@/helpers/nats-message';
import { comparePrivateProductData } from '@/helpers/product-change';
import { sendEditRequestEmails, sendRequestApprovalEmails } from '@/services/ches/private-cloud';
import {
  createEvent,
  privateCloudRequestDetailInclude,
  getLastClosedPrivateCloudRequest,
  models,
  tasks,
} from '@/services/db';
import { upsertUsers } from '@/services/db/user';
import { PrivateCloudEditRequestBody } from '@/validation-schemas/private-cloud';
import { putPathParamSchema } from '../[licencePlate]/schema';

export default async function updateOp({
  session,
  body,
  pathParams,
}: {
  session: Session;
  body: PrivateCloudEditRequestBody;
  pathParams: TypeOf<typeof putPathParamSchema>;
}) {
  const { licencePlate } = pathParams;

  const { data: product } = await models.privateCloudProduct.get({ where: { licencePlate } }, session);

  if (!product?._permissions.edit) {
    return UnauthorizedResponse();
  }

  const { requestComment, quotaContactName, quotaContactEmail, quotaJustification, isAgMinistryChecked, ...rest } =
    body;

  if (!product._permissions.manageMembers) {
    rest.members = product.members.map(({ userId, roles }) => ({ userId, roles }));
  }

  await upsertUsers([body.projectOwner.email, body.primaryTechnicalLead.email, body.secondaryTechnicalLead?.email]);

  const productData = {
    ...rest,
    licencePlate: product.licencePlate,
    status: product.status,
    cluster: product.cluster,
    createdAt: product.createdAt,
    projectOwner: { connect: { email: body.projectOwner.email } },
    primaryTechnicalLead: { connect: { email: body.primaryTechnicalLead.email } },
    secondaryTechnicalLead: body.secondaryTechnicalLead
      ? { connect: { email: body.secondaryTechnicalLead.email } }
      : undefined,
  };

  let decisionStatus: DecisionStatus;

  const hasGolddrEnabledChanged = product.cluster === Cluster.GOLD && product.golddrEnabled !== body.golddrEnabled;

  const quotaChangeStatus = await getQuotaChangeStatus({
    licencePlate: product.licencePlate,
    cluster: product.cluster,
    currentResourceRequests: product.resourceRequests,
    requestedResourceRequests: body.resourceRequests,
  });

  // If there is no quota change or no quota upgrade and no golddr flag changes, the request is automatically approved
  if (quotaChangeStatus.isEligibleForAutoApproval && !hasGolddrEnabledChanged) {
    decisionStatus = DecisionStatus.AUTO_APPROVED;
  } else {
    decisionStatus = DecisionStatus.PENDING;
  }

  // Retrieve the latest request data to acquire the decision data ID that can be assigned to the incoming request's original data.
  const previousRequest = await getLastClosedPrivateCloudRequest(product.licencePlate);

  const { changes, ...otherChangeMeta } = comparePrivateProductData(rest, previousRequest?.decisionData);

  const quotaChangeInfo = quotaChangeStatus.isEligibleForAutoApproval
    ? {}
    : {
        quotaContactName,
        quotaContactEmail,
        quotaJustification,
      };

  const newRequest = (
    await models.privateCloudRequest.create(
      {
        data: {
          active: true,
          type: RequestType.EDIT,
          decisionStatus,
          decisionDate: decisionStatus === DecisionStatus.AUTO_APPROVED ? new Date() : null,
          isQuotaChanged: quotaChangeStatus.hasChange,
          quotaUpgradeResourceDetailList: quotaChangeStatus.resourceDetailList,
          ...quotaChangeInfo,
          createdBy: { connect: { email: session.user.email } },
          licencePlate: product.licencePlate,
          requestComment,
          changes: otherChangeMeta,
          originalData: { connect: { id: previousRequest?.decisionDataId } },
          decisionData: { create: productData },
          requestData: { create: productData },
          project: { connect: { licencePlate: product.licencePlate } },
        },
        include: privateCloudRequestDetailInclude,
      },
      session,
    )
  ).data;

  await Promise.all([
    createEvent(EventType.UPDATE_PRIVATE_CLOUD_PRODUCT, session.user.id, { requestId: newRequest.id }),
    tasks.create(TaskType.REVIEW_PRIVATE_CLOUD_REQUEST, { request: newRequest, requester: session.user.name }),
  ]);

  if (newRequest.decisionStatus === DecisionStatus.PENDING) {
    await sendEditRequestEmails(newRequest, session.user.name);
    return OkResponse(newRequest);
  }

  const proms = [];

  proms.push(
    sendRequestNatsMessage(newRequest, {
      projectOwner: { email: newRequest.originalData?.projectOwner.email },
      primaryTechnicalLead: { email: newRequest.originalData?.primaryTechnicalLead.email },
      secondaryTechnicalLead: { email: newRequest.originalData?.secondaryTechnicalLead?.email },
    }),
  );

  proms.push(sendRequestApprovalEmails(newRequest, session.user.name));

  await Promise.all(proms);

  return OkResponse(newRequest);
}
