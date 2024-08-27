import { DecisionStatus, User } from '@prisma/client';
import { z } from 'zod';
import createApiHandler from '@/core/api-handler';
import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import makeRequestDecision from '@/request-actions/public-cloud/decision-request';
import { sendExpenseAuthorityEmail, sendRequestRejectionEmails } from '@/services/ches/public-cloud/email-handler';
import { subscribeUsersToMautic } from '@/services/mautic';
import { sendPublicCloudNatsMessage } from '@/services/nats';
import { PermissionsEnum } from '@/types/permissions';
import { publicCloudRequestDecisionBodySchema } from '@/validation-schemas/public-cloud';

const pathParamSchema = z.object({
  id: z.string(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  permissions: [PermissionsEnum.ReviewAllPublicCloudRequests],
  validations: { pathParams: pathParamSchema, body: publicCloudRequestDecisionBodySchema },
});
export const POST = apiHandler(async ({ pathParams, body, session }) => {
  const { id } = pathParams;
  const { decision, decisionComment, ...formData } = body;

  const request = await makeRequestDecision(id, decision, decisionComment, formData, session);

  if (!request || !request.decisionData) {
    return BadRequestResponse(`Error creating decision request for ${id}`);
  }

  if (request.decisionStatus === DecisionStatus.REJECTED) {
    await sendRequestRejectionEmails(request.decisionData, decisionComment);
    return OkResponse(request);
  }

  const proms = [];

  if (
    request.decisionStatus === DecisionStatus.APPROVED &&
    request.project?.expenseAuthorityId !== request.decisionData.expenseAuthorityId
  ) {
    proms.push(sendExpenseAuthorityEmail(request.decisionData));
  }

  proms.push(sendPublicCloudNatsMessage(request.type, request.decisionData, request.project));

  // Subscribe users to Mautic
  const users: User[] = [
    request.decisionData.projectOwner,
    request.decisionData.primaryTechnicalLead,
    request.decisionData?.secondaryTechnicalLead,
  ].filter((usr): usr is User => Boolean(usr));

  proms.push(subscribeUsersToMautic(users, request.decisionData.provider, 'Public'));

  await Promise.all(proms);

  // TODO: revisit to delete for good
  // sendRequestApprovalEmails(request);

  return OkResponse(request);
});
