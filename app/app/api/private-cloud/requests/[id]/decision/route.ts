import { DecisionStatus, Prisma, ProjectStatus, RequestType, EventType } from '@prisma/client';
import { z } from 'zod';
import { GlobalRole, GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse, UnprocessableEntityResponse } from '@/core/responses';
import { sendRequestNatsMessage } from '@/helpers/nats-message';
import { sendRequestRejectionEmails, sendRequestApprovalEmails } from '@/services/ches/private-cloud';
import { createEvent, privateCloudRequestDetailInclude } from '@/services/db';
import { upsertUsers } from '@/services/db/user';
import {
  privateCloudRequestDecisionBodySchema,
  PrivateCloudRequestDecisionBody,
} from '@/validation-schemas/private-cloud';
import { deleteRequestDecisionBodySchema } from '@/validation-schemas/shared';

const pathParamSchema = z.object({
  id: z.string(),
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  permissions: [GlobalPermissions.ReviewAllPrivateCloudRequests],
  validations: {
    pathParams: pathParamSchema,
    body: z.union([deleteRequestDecisionBodySchema, privateCloudRequestDecisionBodySchema]),
  },
});
export const POST = apiHandler(async ({ pathParams, body, session }) => {
  const { id } = pathParams;

  const request = await prisma.privateCloudRequest.findUnique({
    where: {
      id,
      active: true,
      decisionStatus: DecisionStatus.PENDING,
    },
    include: {
      project: { select: { cluster: true } },
      decisionData: { select: { cluster: true } },
    },
  });

  if (!request) {
    return BadRequestResponse('request not found');
  }

  const { type, decision, decisionComment, quotaContactName, quotaContactEmail, quotaJustification, ...validFormData } =
    body as PrivateCloudRequestDecisionBody;

  const dataToUpdate: Prisma.PrivateCloudRequestUpdateInput = {
    active: decision === DecisionStatus.APPROVED,
    decisionStatus: decision,
    decisionComment,
    decisionDate: new Date(),
    decisionMaker: { connect: { email: session.user.email } },
  };

  // No need to modify decision data when reviewing deletion requests.
  if (request.type !== RequestType.DELETE) {
    await upsertUsers([
      validFormData.projectOwner.email,
      validFormData.primaryTechnicalLead.email,
      validFormData.secondaryTechnicalLead?.email,
    ]);

    dataToUpdate.decisionData = {
      update: {
        ...validFormData,
        status: ProjectStatus.ACTIVE,
        licencePlate: request.licencePlate,
        cluster: request.project?.cluster ?? request.decisionData.cluster,
        projectOwner: { connect: { email: validFormData.projectOwner.email } },
        primaryTechnicalLead: { connect: { email: validFormData.primaryTechnicalLead.email } },
        secondaryTechnicalLead: validFormData.secondaryTechnicalLead
          ? { connect: { email: validFormData.secondaryTechnicalLead.email } }
          : undefined,
      },
    };
  }

  const updatedRequest = await prisma.privateCloudRequest.update({
    where: {
      id: request.id,
      active: true,
    },
    include: privateCloudRequestDetailInclude,
    data: dataToUpdate,
  });

  if (!updatedRequest) {
    return UnprocessableEntityResponse('failed to update the request');
  }

  await createEvent(EventType.REVIEW_PRIVATE_CLOUD_REQUEST, session.user.id, { requestId: updatedRequest.id });

  if (updatedRequest.decisionStatus === DecisionStatus.REJECTED) {
    await sendRequestRejectionEmails(updatedRequest);
    return OkResponse(updatedRequest);
  }

  const proms = [];

  proms.push(
    sendRequestNatsMessage(updatedRequest, {
      projectOwner: { email: updatedRequest.originalData?.projectOwner.email },
      primaryTechnicalLead: { email: updatedRequest.originalData?.primaryTechnicalLead.email },
      secondaryTechnicalLead: { email: updatedRequest.originalData?.secondaryTechnicalLead?.email },
    }),
  );

  proms.push(sendRequestApprovalEmails(updatedRequest, session.user.name));

  await Promise.all(proms);

  return OkResponse(updatedRequest);
});
