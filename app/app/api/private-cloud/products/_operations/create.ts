import { DecisionStatus, ProjectStatus, RequestType, EventType } from '@prisma/client';
import { Session } from 'next-auth';
import { defaultQuota } from '@/constants';
import prisma from '@/core/prisma';
import { OkResponse, UnauthorizedResponse } from '@/core/responses';
import generateLicencePlate from '@/helpers/licence-plate';
import { sendCreateRequestEmails } from '@/services/ches/private-cloud';
import { createEvent, privateCloudRequestDetailInclude } from '@/services/db';
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

  const newRequest = await prisma.privateCloudRequest.create({
    data: {
      active: true,
      licencePlate,
      type: RequestType.CREATE,
      decisionStatus: DecisionStatus.PENDING,
      createdBy: { connect: { email: session.user.email } },
      requestComment: body.requestComment,
      decisionData: { create: productData },
      requestData: { create: productData },
    },
    include: privateCloudRequestDetailInclude,
  });

  await Promise.all([
    createEvent(EventType.CREATE_PRIVATE_CLOUD_PRODUCT, session.user.id, { requestId: newRequest.id }),
    sendCreateRequestEmails(newRequest, user.name),
  ]);

  return OkResponse(newRequest);
}
