import { z } from 'zod';
import { GlobalRole, GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse, UnprocessableEntityResponse } from '@/core/responses';
import { EventType, DecisionStatus, Prisma, ProjectStatus, RequestType, TaskType } from '@/prisma/client';
import { sendRequestRejectionEmails, sendRequestApprovalEmails } from '@/services/ches/public-cloud';
import { createEvent, models, publicCloudRequestDetailInclude, tasks } from '@/services/db';
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

  const {
    projectOwnerId,
    primaryTechnicalLeadId,
    secondaryTechnicalLeadId,
    expenseAuthorityId,
    type,
    decision,
    decisionComment,
    requestComment,
    ...rest
  } = body as PublicCloudRequestDecisionBody;

  const dataToUpdate: Prisma.PublicCloudRequestUpdateInput = {
    active: decision === DecisionStatus.APPROVED,
    decisionStatus: decision,
    decisionComment,
    decisionDate: new Date(),
    decisionMaker: { connect: { email: session.user.email } },
  };

  // No need to modify decision data when reviewing deletion requests.
  if (request.type !== RequestType.DELETE) {
    dataToUpdate.decisionData = {
      update: {
        ...rest,
        status: ProjectStatus.ACTIVE,
        licencePlate: request.licencePlate,
        provider: request.project?.provider ?? request.decisionData.provider,
        projectOwner: { connect: { id: projectOwnerId } },
        primaryTechnicalLead: { connect: { id: primaryTechnicalLeadId } },
        secondaryTechnicalLead: secondaryTechnicalLeadId ? { connect: { id: secondaryTechnicalLeadId } } : undefined,
        expenseAuthority: expenseAuthorityId ? { connect: { id: expenseAuthorityId } } : undefined,
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

  const proms: any[] = [];

  proms.push(sendPublicCloudNatsMessage(updatedRequestDecorated));
  proms.push(sendRequestApprovalEmails(updatedRequestDecorated));

  await Promise.all(proms);

  return OkResponse(updatedRequest);
});
