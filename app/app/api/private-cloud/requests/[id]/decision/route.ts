import { $Enums, DecisionStatus, User } from '@prisma/client';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { sendRequestNatsMessage } from '@/helpers/nats-message';
import makeRequestDecision from '@/request-actions/private-cloud/decision-request';
import { sendRequestRejectionEmails, sendRequestApprovalEmails } from '@/services/ches/private-cloud/email-handler';
import { subscribeUsersToMautic } from '@/services/mautic';
import { PermissionsEnum } from '@/types/permissions';
import { privateCloudRequestDecisionBodySchema } from '@/validation-schemas/private-cloud';

const pathParamSchema = z.object({
  id: z.string(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  permissions: [PermissionsEnum.ReviewAllPrivateCloudRequests],
  validations: { pathParams: pathParamSchema, body: privateCloudRequestDecisionBodySchema },
});
export const POST = apiHandler(async ({ pathParams, body, session }) => {
  const { id } = pathParams;
  const { decision, decisionComment, ...formData } = body;

  const request = await makeRequestDecision(id, decision, decisionComment, formData, session);

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

  const users: User[] = [
    request.decisionData.projectOwner,
    request.decisionData.primaryTechnicalLead,
    request.decisionData?.secondaryTechnicalLead,
  ].filter((usr): usr is User => Boolean(usr));

  // Subscribe users to Mautic
  proms.push(subscribeUsersToMautic(users, request.decisionData.cluster, 'Private'));

  if (request.type == $Enums.RequestType.EDIT) {
    proms.push(sendRequestApprovalEmails(request));
  }

  await Promise.all(proms);

  return OkResponse(request);
});
