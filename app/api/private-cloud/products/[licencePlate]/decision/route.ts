import { z } from 'zod';
import { $Enums, Cluster, DecisionStatus, User } from '@prisma/client';
import { PermissionsEnum } from '@/types/permissions';
import { PrivateCloudDecisionRequestBodySchema } from '@/schema';
import makeRequestDecision from '@/request-actions/private-cloud/decision-request';
import createApiHandler from '@/core/api-handler';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { subscribeUsersToMautic } from '@/services/mautic';
import { sendRequestRejectionEmails, sendRequestApprovalEmails } from '@/services/ches/private-cloud/email-handler';
import { sendRequestNatsMessage } from '@/helpers/nats-message';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  permissions: [PermissionsEnum.ReviewAllPrivateCloudRequests],
  validations: { pathParams: pathParamSchema, body: PrivateCloudDecisionRequestBodySchema },
});
export const POST = apiHandler(async ({ pathParams, body, session }) => {
  const { userEmail } = session;
  const { licencePlate } = pathParams;
  const { decision, decisionComment, ...requestedProjectFormData } = body;

  const request = await makeRequestDecision(
    licencePlate,
    decision,
    decisionComment,
    requestedProjectFormData,
    userEmail as string,
  );

  if (!request.requestedProject) {
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
      projectOwner: { email: requestedProjectFormData.projectOwner.email },
      primaryTechnicalLead: { email: requestedProjectFormData.primaryTechnicalLead.email },
      secondaryTechnicalLead: { email: requestedProjectFormData.secondaryTechnicalLead?.email },
    }),
  );

  const users: User[] = [
    request.requestedProject.projectOwner,
    request.requestedProject.primaryTechnicalLead,
    request.requestedProject?.secondaryTechnicalLead,
  ].filter((usr): usr is User => Boolean(usr));

  // Subscribe users to Mautic
  proms.push(subscribeUsersToMautic(users, request.requestedProject.cluster, 'Private'));

  if (request.type == $Enums.RequestType.EDIT) {
    proms.push(sendRequestApprovalEmails(request));
  }

  await Promise.all(proms);

  return OkResponse(`Decision request for ${request.licencePlate} successfully created.`);
});
