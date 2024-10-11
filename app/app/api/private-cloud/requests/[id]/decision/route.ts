import { DecisionStatus } from '@prisma/client';
import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { BadRequestResponse, OkResponse } from '@/core/responses';
import { sendRequestNatsMessage } from '@/helpers/nats-message';
import makeRequestDecision from '@/request-actions/private-cloud/decision-request';
import { sendRequestRejectionEmails, sendRequestApprovalEmails } from '@/services/ches/private-cloud';
import { PermissionsEnum } from '@/types/permissions';
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
  permissions: [PermissionsEnum.ReviewAllPrivateCloudRequests],
  validations: {
    pathParams: pathParamSchema,
    body: z.union([deleteRequestDecisionBodySchema, privateCloudRequestDecisionBodySchema]),
  },
});
export const POST = apiHandler(async ({ pathParams, body, session }) => {
  const { id } = pathParams;
  const request = await makeRequestDecision(id, body as PrivateCloudRequestDecisionBody, session);

  if (!request || !request.decisionData) {
    return BadRequestResponse(`Error creating decision request for ${id}`);
  }

  if (request.decisionStatus === DecisionStatus.REJECTED) {
    await sendRequestRejectionEmails(request);
    return OkResponse(request);
  }

  const proms = [];

  proms.push(
    sendRequestNatsMessage(request, {
      projectOwner: { email: request.originalData?.projectOwner.email },
      primaryTechnicalLead: { email: request.originalData?.primaryTechnicalLead.email },
      secondaryTechnicalLead: { email: request.originalData?.secondaryTechnicalLead?.email },
    }),
  );

  proms.push(sendRequestApprovalEmails(request, session.user.name));

  await Promise.all(proms);

  return OkResponse(request);
});
