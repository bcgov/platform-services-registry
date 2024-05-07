import { BadRequestResponse, OkResponse, UnauthorizedResponse } from '@/core/responses';
import { PermissionsEnum } from '@/types/permissions';
import { DecisionStatus, User } from '@prisma/client';
import { z } from 'zod';
import { PublicCloudRequestDecisionBodySchema } from '@/schema';
import makeRequestDecision, {
  PublicCloudRequestWithProjectAndRequestedProject,
} from '@/request-actions/public-cloud/decision-request';
import createApiHandler from '@/core/api-handler';
import { sendPublicCloudNatsMessage } from '@/services/nats';
import { subscribeUsersToMautic } from '@/services/mautic';
import { sendExpenseAuthorityEmail, sendRequestRejectionEmails } from '@/services/ches/public-cloud/email-handler';
import { wrapAsync } from '@/helpers/runtime';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  permissions: [PermissionsEnum.ReviewAllPublicCloudRequests],
  validations: { pathParams: pathParamSchema, body: PublicCloudRequestDecisionBodySchema },
});

export const POST = apiHandler(async ({ pathParams, body, session }) => {
  const { userEmail } = session;
  const { licencePlate } = pathParams;
  const { decision, decisionComment, ...decisionDataFormData } = body;

  const request: PublicCloudRequestWithProjectAndRequestedProject = await makeRequestDecision(
    licencePlate,
    decision,
    decisionComment,
    decisionDataFormData,
    userEmail as string,
  );

  if (!request.decisionData) {
    return BadRequestResponse(`Error creating decision request for ${request.licencePlate}`);
  }

  if (request.decisionStatus !== DecisionStatus.APPROVED) {
    wrapAsync(() => sendRequestRejectionEmails(request.decisionData, decisionComment));
    return OkResponse(`Request for ${request.licencePlate} successfully created as rejected.`);
  }
  if (
    request.decisionStatus === DecisionStatus.APPROVED &&
    request.project?.expenseAuthorityId !== request.decisionData.expenseAuthorityId
  ) {
    wrapAsync(() => sendExpenseAuthorityEmail(request.decisionData));
  }

  await sendPublicCloudNatsMessage(request.type, request.decisionData, request.project);

  // Subscribe users to Mautic
  const users: User[] = [
    request.decisionData.projectOwner,
    request.decisionData.primaryTechnicalLead,
    request.decisionData?.secondaryTechnicalLead,
  ].filter((usr): usr is User => Boolean(usr));

  await subscribeUsersToMautic(users, request.decisionData.provider, 'Public');

  // TODO: revisit to delete for good
  // sendRequestApprovalEmails(request);

  return OkResponse(`Decision request for ${request.licencePlate} successfully created.`);
});
