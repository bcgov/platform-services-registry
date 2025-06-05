import { z } from 'zod';
import { GlobalRole, GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { BadRequestResponse, OkResponse, UnprocessableEntityResponse } from '@/core/responses';
import { sendRequestNatsMessage } from '@/helpers/nats-message';
import { DecisionStatus, Prisma, ProjectStatus, RequestType, EventType, TaskType } from '@/prisma/client';
import { sendRequestRejectionEmails, sendRequestApprovalEmails } from '@/services/ches/private-cloud';
import { createEvent, models, privateCloudRequestDetailInclude, tasks } from '@/services/db';
import {
  privateCloudRequestDecisionBodySchema,
  PrivateCloudRequestDecisionBody,
} from '@/validation-schemas/private-cloud';
import { deleteRequestApproveBodySchema, deleteRequestRejectBodySchema } from '@/validation-schemas/shared';

const pathParamSchema = z.object({
  id: z.string(),
});

const apiHandler = createApiHandler({
  roles: [GlobalRole.User],
  permissions: [GlobalPermissions.ReviewAllPrivateCloudRequests],
  validations: {
    pathParams: pathParamSchema,
    body: z.union([
      deleteRequestApproveBodySchema,
      deleteRequestRejectBodySchema,
      privateCloudRequestDecisionBodySchema,
    ]),
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

  const {
    projectOwnerId,
    primaryTechnicalLeadId,
    secondaryTechnicalLeadId,
    type,
    decision,
    decisionComment,
    requestComment,
    quotaContactName,
    quotaContactEmail,
    quotaJustification,
    ...validFormData
  } = body as PrivateCloudRequestDecisionBody;

  const dataToUpdate: Prisma.PrivateCloudRequestUpdateInput = {
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
        ...validFormData,
        status: ProjectStatus.ACTIVE,
        licencePlate: request.licencePlate,
        cluster: request.project?.cluster ?? request.decisionData.cluster,
        projectOwner: { connect: { id: projectOwnerId } },
        primaryTechnicalLead: { connect: { id: primaryTechnicalLeadId } },
        secondaryTechnicalLead: secondaryTechnicalLeadId ? { connect: { id: secondaryTechnicalLeadId } } : undefined,
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

  if (request.type === RequestType.DELETE) {
    const updatedProduct = await prisma.privateCloudProduct.update({
      where: {
        licencePlate: request.licencePlate,
      },
      data: {
        archivedAt: new Date(),
      },
    });

    if (!updatedProduct) {
      return UnprocessableEntityResponse('failed to update the product');
    }
  }

  const updatedRequestDecorated = await models.privateCloudRequest.decorate(updatedRequest, session, true);

  await Promise.all([
    createEvent(EventType.REVIEW_PRIVATE_CLOUD_REQUEST, session.user.id, { requestId: updatedRequestDecorated.id }),
    tasks.close(TaskType.REVIEW_PRIVATE_CLOUD_REQUEST, {
      requestId: request.id,
      licencePlate: request.licencePlate,
      session,
      decision,
    }),
  ]);

  if (updatedRequestDecorated.decisionStatus === DecisionStatus.REJECTED) {
    await sendRequestRejectionEmails(updatedRequestDecorated);
    return OkResponse(updatedRequestDecorated);
  }

  const proms: any[] = [];

  proms.push(
    sendRequestNatsMessage(updatedRequestDecorated, {
      projectOwner: { email: updatedRequestDecorated.originalData?.projectOwner.email },
      primaryTechnicalLead: { email: updatedRequestDecorated.originalData?.primaryTechnicalLead.email },
      secondaryTechnicalLead: { email: updatedRequestDecorated.originalData?.secondaryTechnicalLead?.email },
    }),
  );

  proms.push(sendRequestApprovalEmails(updatedRequestDecorated, session.user.name));

  await Promise.all(proms);

  return OkResponse(updatedRequest);
});
