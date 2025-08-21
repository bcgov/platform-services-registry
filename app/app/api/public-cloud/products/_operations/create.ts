import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import generateLicencePlate from '@/helpers/licence-plate';
import { DecisionStatus, ProjectStatus, RequestType, TaskType, EventType } from '@/prisma/client';
import { sendCreateRequestEmails } from '@/services/ches/public-cloud';
import { createEvent, models, publicCloudRequestDetailInclude, tasks } from '@/services/db';
import { PublicCloudCreateRequestBody } from '@/validation-schemas/public-cloud';

export default async function createOp({ session, body }: { session: Session; body: PublicCloudCreateRequestBody }) {
  const { user, permissions, organizationIds } = session;

  const canCreate =
    // 1. can create one globally
    permissions.createPublicCloudProducts ||
    // 2. can create one as an product member
    [body.projectOwnerId, body.primaryTechnicalLeadId, body.secondaryTechnicalLeadId].includes(user.id) ||
    // 3. can create one as a ministry editor
    organizationIds.editor.includes(body.organizationId);

  if (!canCreate) {
    return UnauthorizedResponse();
  }

  const licencePlate = await generateLicencePlate();

  const {
    projectOwnerId,
    primaryTechnicalLeadId,
    secondaryTechnicalLeadId,
    expenseAuthorityId,
    requestComment,
    isAgMinistry,
    isAgMinistryChecked,
    organizationId,
    ...rest
  } = body;

  if (!expenseAuthorityId) {
    return BadRequestResponse('invalid expensive authority');
  }

  const productData = {
    ...rest,
    licencePlate,
    status: ProjectStatus.ACTIVE,
    organization: { connect: { id: organizationId } },
    projectOwner: { connect: { id: projectOwnerId } },
    primaryTechnicalLead: { connect: { id: primaryTechnicalLeadId } },
    secondaryTechnicalLead: secondaryTechnicalLeadId ? { connect: { id: secondaryTechnicalLeadId } } : undefined,
    expenseAuthority: { connect: { id: expenseAuthorityId } },
  };

  const newRequest = (
    await models.publicCloudRequest.create(
      {
        data: {
          active: true,
          licencePlate,
          type: RequestType.CREATE,
          decisionStatus: DecisionStatus.PENDING,
          createdBy: { connect: { email: session.user.email } },
          decisionData: { create: productData },
          requestData: { create: productData },
        },
        include: publicCloudRequestDetailInclude,
      },
      session,
    )
  ).data;

  const proms: any[] = [];

  const { data: billing } = await models.publicCloudBilling.create(
    {
      data: {
        licencePlate,
        expenseAuthority: { connect: { id: expenseAuthorityId } },
        accountCoding: {
          cc: '',
          rc: '',
          sl: '',
          stob: '',
          pc: '',
        },
      },
    },
    session,
  );

  proms.push(
    tasks.create(TaskType.SIGN_PUBLIC_CLOUD_MOU, { request: newRequest, billing }),
    sendCreateRequestEmails(newRequest, user.name, billing),
    createEvent(EventType.CREATE_PUBLIC_CLOUD_PRODUCT, session.user.id, { requestId: newRequest.id }),
  );

  await Promise.all(proms);

  return OkResponse(newRequest);
}
