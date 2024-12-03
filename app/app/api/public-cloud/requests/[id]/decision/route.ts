import { EventType, DecisionStatus, Prisma, ProjectStatus, RequestType, TaskType } from '@prisma/client';
import { z } from 'zod';
import { GlobalRole, GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse, UnprocessableEntityResponse } from '@/core/responses';
import { sendRequestRejectionEmails, sendRequestApprovalEmails } from '@/services/ches/public-cloud';
import { createEvent, models, publicCloudRequestDetailInclude, tasks } from '@/services/db';
import { upsertUsers } from '@/services/db/user';
import { sendPublicCloudNatsMessage } from '@/services/nats';
import {
  publicCloudRequestDecisionBodySchema,
  PublicCloudRequestDecisionBody,
} from '@/validation-schemas/public-cloud';
import { deleteRequestDecisionBodySchema } from '@/validation-schemas/shared';

const pathParamSchema = z.object({
  id: z.string(),
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  permissions: [GlobalPermissions.ReviewAllPublicCloudRequests],
  validations: {
    pathParams: pathParamSchema,
    body: z.union([deleteRequestDecisionBodySchema, publicCloudRequestDecisionBodySchema]),
  },
});
export const POST = apiHandler(async ({ pathParams, body, session }) => {
  const { id } = pathParams;

  const request = await prisma.publicCloudRequest.findUnique({
    where: {
      id,
      active: true,
      decisionStatus: DecisionStatus.PENDING,
    },
    include: {
      project: { select: { provider: true } },
      decisionData: { select: { provider: true } },
    },
  });

  if (!request) {
    return BadRequestResponse('request not found');
  }

  const { type, decision, decisionComment, accountCoding, ...rest } = body as PublicCloudRequestDecisionBody;

  const dataToUpdate: Prisma.PublicCloudRequestUpdateInput = {
    active: decision === DecisionStatus.APPROVED,
    decisionStatus: decision,
    decisionComment,
    decisionDate: new Date(),
    decisionMaker: { connect: { email: session.user.email } },
  };

  // No need to modify decision data when reviewing deletion requests.
  if (request.type !== RequestType.DELETE) {
    await upsertUsers([
      rest.projectOwner.email,
      rest.primaryTechnicalLead.email,
      rest.secondaryTechnicalLead?.email,
      rest.expenseAuthority?.email,
    ]);

    dataToUpdate.decisionData = {
      update: {
        ...rest,
        status: ProjectStatus.ACTIVE,
        licencePlate: request.licencePlate,
        provider: request.project?.provider ?? request.decisionData.provider,
        projectOwner: { connect: { email: rest.projectOwner.email } },
        primaryTechnicalLead: { connect: { email: rest.primaryTechnicalLead.email } },
        secondaryTechnicalLead: rest.secondaryTechnicalLead
          ? { connect: { email: rest.secondaryTechnicalLead.email } }
          : undefined,
        expenseAuthority: rest.expenseAuthority ? { connect: { email: rest.expenseAuthority.email } } : undefined,
      },
    };
  }

  const updatedRequest = await prisma.publicCloudRequest.update({
    where: {
      id: request.id,
      active: true,
    },
    include: publicCloudRequestDetailInclude,
    data: dataToUpdate,
  });

  if (!updatedRequest) {
    return UnprocessableEntityResponse('failed to update the request');
  }

  const updatedRequestDecorated = await models.publicCloudRequest.decorate(updatedRequest, session, true);

  await Promise.all([
    createEvent(EventType.REVIEW_PUBLIC_CLOUD_REQUEST, session.user.id, { requestId: updatedRequest.id }),
    tasks.close(TaskType.REVIEW_PUBLIC_CLOUD_REQUEST, {
      requestId: request.id,
      licencePlate: request.licencePlate,
      session,
      decision,
    }),
  ]);

  if (updatedRequest.decisionStatus === DecisionStatus.REJECTED) {
    await sendRequestRejectionEmails(updatedRequestDecorated);
    return OkResponse(updatedRequest);
  }

  const proms = [];

  proms.push(sendPublicCloudNatsMessage(updatedRequestDecorated));
  proms.push(sendRequestApprovalEmails(updatedRequestDecorated));

  await Promise.all(proms);

  return OkResponse(updatedRequest);
});
