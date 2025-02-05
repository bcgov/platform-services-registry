import { DecisionStatus, ProjectStatus, RequestType, TaskStatus, TaskType, EventType, Provider } from '@prisma/client';
import { Session } from 'next-auth';
import prisma from '@/core/prisma';
import { OkResponse, UnauthorizedResponse, UnprocessableEntityResponse } from '@/core/responses';
import generateLicencePlate from '@/helpers/licence-plate';
import { sendCreateRequestEmails } from '@/services/ches/public-cloud';
import { createEvent, models, publicCloudRequestDetailInclude, tasks } from '@/services/db';
import { PublicCloudCreateRequestBody } from '@/validation-schemas/public-cloud';

export default async function createOp({ session, body }: { session: Session; body: PublicCloudCreateRequestBody }) {
  const { user, permissions, ministries } = session;

  const canCreate =
    // 1. can create one globally
    permissions.createPublicCloudProducts ||
    // 2. can create one as an product member
    [body.projectOwner.id, body.primaryTechnicalLead.id, body.secondaryTechnicalLead?.id].includes(user.id) ||
    // 3. can create one as a ministry editor
    ministries.editor.includes(body.ministry);

  if (!canCreate) {
    return UnauthorizedResponse();
  }

  const licencePlate = await generateLicencePlate();

  const { requestComment, accountCoding, isAgMinistryChecked, isEaApproval, ...rest } = body;

  const billingProvider = body.provider === Provider.AZURE ? Provider.AZURE : Provider.AWS;
  const billingCode = `${body.accountCoding}_${billingProvider}`;

  const productData = {
    ...rest,
    licencePlate,
    status: ProjectStatus.ACTIVE,
    projectOwner: { connect: { id: body.projectOwner.id } },
    primaryTechnicalLead: { connect: { id: body.primaryTechnicalLead.id } },
    secondaryTechnicalLead: body.secondaryTechnicalLead
      ? { connect: { id: body.secondaryTechnicalLead.id } }
      : undefined,
    expenseAuthority: body.expenseAuthority ? { connect: { id: body.expenseAuthority.id } } : undefined,
    billing: {
      connectOrCreate: {
        where: {
          code: billingCode,
        },
        create: {
          code: billingCode,
          accountCoding: body.accountCoding,
          expenseAuthority: {
            connectOrCreate: {
              where: {
                id: body.expenseAuthority.id,
              },
              create: body.expenseAuthority,
            },
          },
          licencePlate,
        },
      },
    },
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

  const proms = [];

  // Assign a task to the expense authority for new billing
  if (newRequest.decisionData.expenseAuthorityId && !newRequest.decisionData.billing.signed) {
    const taskProm = tasks.create(TaskType.SIGN_PUBLIC_CLOUD_MOU, { request: newRequest });
    proms.push(taskProm);
  } else {
    proms.push(
      tasks.create(TaskType.REVIEW_PUBLIC_CLOUD_REQUEST, { request: newRequest, requester: session.user.name }),
    );
  }

  proms.push(
    createEvent(EventType.CREATE_PUBLIC_CLOUD_PRODUCT, session.user.id, { requestId: newRequest.id }),
    sendCreateRequestEmails(newRequest, user.name),
  );

  await Promise.all(proms);

  return OkResponse(newRequest);
}
