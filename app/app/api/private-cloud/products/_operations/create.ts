import { DecisionStatus, ProjectStatus, RequestType, EventType } from '@prisma/client';
import { Session } from 'next-auth';
import { defaultQuota } from '@/constants';
import { OkResponse, UnauthorizedResponse, UnprocessableEntityResponse } from '@/core/responses';
import generateLicencePlate from '@/helpers/licence-plate';
import { sendRequestNatsMessage } from '@/helpers/nats-message';
import { sendCreateRequestEmails, sendRequestApprovalEmails } from '@/services/ches/private-cloud';
import { createEvent, models, privateCloudRequestDetailInclude } from '@/services/db';
import { upsertUsers } from '@/services/db/user';
import { PrivateCloudCreateRequestBody } from '@/validation-schemas/private-cloud';

export default async function createOp({ session, body }: { session: Session; body: PrivateCloudCreateRequestBody }) {
  const { user, permissions, ministries } = session;

  const canCreate =
    // 1. can create one globally
    permissions.createPrivateCloudProducts ||
    // 2. can create one as an product member
    [body.projectOwner.email, body.primaryTechnicalLead.email, body.secondaryTechnicalLead?.email].includes(
      user.email,
    ) ||
    // 3. can create one as a ministry editor
    ministries.editor.includes(body.ministry);

  if (!canCreate) {
    return UnauthorizedResponse();
  }

  const licencePlate = await generateLicencePlate();

  await upsertUsers([body.projectOwner.email, body.primaryTechnicalLead.email, body.secondaryTechnicalLead?.email]);

  const { requestComment, quotaContactName, quotaContactEmail, quotaJustification, isAgMinistryChecked, ...rest } =
    body;

  const productData = {
    ...rest,
    licencePlate,
    status: ProjectStatus.ACTIVE,
    productionQuota: defaultQuota,
    testQuota: defaultQuota,
    toolsQuota: defaultQuota,
    developmentQuota: defaultQuota,
    projectOwner: { connect: { email: body.projectOwner.email } },
    primaryTechnicalLead: { connect: { email: body.primaryTechnicalLead.email } },
    secondaryTechnicalLead: body.secondaryTechnicalLead
      ? { connect: { email: body.secondaryTechnicalLead.email } }
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
    proms.push(sendCreateRequestEmails(newRequest, user.name));
  }

  await Promise.all(proms);

  return OkResponse(newRequest);
}
