import { DecisionStatus, ProjectStatus, RequestType, EventType, TaskType } from '@prisma/client';
import { Session } from 'next-auth';
import { defaultResourceRequests } from '@/constants';
import prisma from '@/core/prisma';
import { OkResponse, UnauthorizedResponse, UnprocessableEntityResponse } from '@/core/responses';
import generateLicencePlate from '@/helpers/licence-plate';
import { sendRequestNatsMessage } from '@/helpers/nats-message';
import { sendCreateRequestEmails, sendRequestApprovalEmails } from '@/services/ches/private-cloud';
import { createEvent, models, privateCloudRequestDetailInclude, tasks } from '@/services/db';
import { PrivateCloudCreateRequestBody } from '@/validation-schemas/private-cloud';

export default async function createOp({ session, body }: { session: Session; body: PrivateCloudCreateRequestBody }) {
  const { user, permissions, ministries } = session;

  const canCreate =
    // 1. can create one globally
    permissions.createPrivateCloudProducts ||
    // 2. can create one as an product member
    [body.projectOwner.id, body.primaryTechnicalLead.id, body.secondaryTechnicalLead?.id].includes(user.id) ||
    // 3. can create one as a ministry editor
    ministries.editor.includes(body.ministry);

  if (!canCreate) {
    return UnauthorizedResponse();
  }

  const licencePlate = await generateLicencePlate();

  const {
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
    resourceRequests: {
      development: defaultResourceRequests,
      test: defaultResourceRequests,
      production: defaultResourceRequests,
      tools: defaultResourceRequests,
    },
    projectOwner: { connect: { id: body.projectOwner.id } },
    primaryTechnicalLead: { connect: { id: body.primaryTechnicalLead.id } },
    secondaryTechnicalLead: body.secondaryTechnicalLead
      ? { connect: { id: body.secondaryTechnicalLead.id } }
      : undefined,
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
        projectOwner: { id: newRequest.originalData?.projectOwner.id },
        primaryTechnicalLead: { id: newRequest.originalData?.primaryTechnicalLead.id },
        secondaryTechnicalLead: { id: newRequest.originalData?.secondaryTechnicalLead?.id },
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
