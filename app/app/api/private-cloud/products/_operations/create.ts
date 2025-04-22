import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import generateLicencePlate from '@/helpers/licence-plate';
import { sendRequestNatsMessage } from '@/helpers/nats-message';
import { DecisionStatus, ProjectStatus, RequestType, EventType, TaskType } from '@/prisma/types';
import { sendCreateRequestEmails, sendRequestApprovalEmails } from '@/services/ches/private-cloud';
import { createEvent, models, privateCloudRequestDetailInclude, tasks } from '@/services/db';
import { PrivateCloudCreateRequestBody } from '@/validation-schemas/private-cloud';

export default async function createOp({ session, body }: { session: Session; body: PrivateCloudCreateRequestBody }) {
  const { user, permissions, ministries } = session;

  const canCreate =
    // 1. can create one globally
    permissions.createPrivateCloudProducts ||
    // 2. can create one as an product member
    [body.projectOwnerId, body.primaryTechnicalLeadId, body.secondaryTechnicalLeadId].includes(user.id) ||
    // 3. can create one as a ministry editor
    ministries.editor.includes(body.ministry);

  if (!canCreate) {
    return UnauthorizedResponse();
  }

  const licencePlate = await generateLicencePlate();

  const {
    projectOwnerId,
    primaryTechnicalLeadId,
    secondaryTechnicalLeadId,
    requestComment,
    quotaContactName,
    quotaContactEmail,
    quotaJustification,
    isAgMinistryChecked,
    url,
    secret,
    username,
    password,
    ...rest
  } = body;

  const productData = {
    ...rest,
    licencePlate,
    status: ProjectStatus.ACTIVE,
    projectOwner: { connect: { id: projectOwnerId } },
    primaryTechnicalLead: { connect: { id: primaryTechnicalLeadId } },
    secondaryTechnicalLead: secondaryTechnicalLeadId ? { connect: { id: secondaryTechnicalLeadId } } : undefined,
  };

  const decisionStatus = productData.isTest ? DecisionStatus.AUTO_APPROVED : DecisionStatus.PENDING;
  const decisionDate = decisionStatus === DecisionStatus.AUTO_APPROVED ? new Date() : null;

  const newRequest = (
    await models.privateCloudRequest.create(
      {
        data: {
          active: true,
          licencePlate,
          type: RequestType.CREATE,
          decisionStatus,
          decisionDate,
          createdBy: { connect: { email: session.user.email } },
          requestComment: body.requestComment,
          decisionData: { create: productData },
          requestData: { create: productData },
        },
        include: privateCloudRequestDetailInclude,
      },
      session,
    )
  ).data;

  const proms: (Promise<any> | undefined)[] = [
    createEvent(EventType.CREATE_PRIVATE_CLOUD_PRODUCT, session.user.id, { requestId: newRequest.id }),
    prisma.privateCloudProductWebhook.create({
      data: {
        licencePlate,
        url,
        secret,
        username,
        password,
      },
    }),
  ];

  if (decisionStatus === DecisionStatus.AUTO_APPROVED) {
    proms.push(
      sendRequestNatsMessage(newRequest, {
        projectOwner: { email: newRequest.originalData?.projectOwner.email },
        primaryTechnicalLead: { email: newRequest.originalData?.primaryTechnicalLead.email },
        secondaryTechnicalLead: { email: newRequest.originalData?.secondaryTechnicalLead?.email },
      }),
      sendRequestApprovalEmails(newRequest, session.user.name),
    );
  } else {
    proms.push(
      sendCreateRequestEmails(newRequest, user.name),
      tasks.create(TaskType.REVIEW_PRIVATE_CLOUD_REQUEST, { request: newRequest, requester: user.name }),
    );
  }

  await Promise.all(proms);

  return OkResponse(newRequest);
}
