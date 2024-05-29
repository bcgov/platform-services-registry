import { $Enums, Cluster, DecisionStatus, User } from '@prisma/client';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { sendRequestNatsMessage } from '@/helpers/nats-message';
import makeRequestDecision from '@/request-actions/private-cloud/decision-request';
import { PrivateCloudDecisionRequestBodySchema } from '@/schema';
import { sendRequestRejectionEmails, sendRequestApprovalEmails } from '@/services/ches/private-cloud/email-handler';
import { subscribeUsersToMautic } from '@/services/mautic';
import { PermissionsEnum } from '@/types/permissions';

const pathParamSchema = z.object({
  id: z.string(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  permissions: [PermissionsEnum.ReviewAllPrivateCloudRequests],
  validations: { pathParams: pathParamSchema, body: PrivateCloudDecisionRequestBodySchema },
});
export const POST = apiHandler(async ({ pathParams, body, session }) => {
  const { userEmail } = session;
  const { id } = pathParams;
  const { decision, decisionComment, ...decisionDataFormData } = body;

  const request = await makeRequestDecision(id, decision, decisionComment, decisionDataFormData, userEmail as string);

  if (!request.decisionData) {
    return BadRequestResponse(`Error creating decision request for ${request.licencePlate}`);
  }

  if (request.decisionStatus !== DecisionStatus.APPROVED) {
    // Send rejection email, message will need to be passed
    await sendRequestRejectionEmails(request, decisionComment);
    return OkResponse(`Request for ${request.licencePlate} successfully created as rejected.`);
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

  return OkResponse(`Decision request for ${request.licencePlate} successfully created.`);
});
