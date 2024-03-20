import { NextRequest, NextResponse } from 'next/server';
import { PermissionsEnum } from '@/types/permissions';
import { DecisionStatus, User } from '@prisma/client';
import { string, z } from 'zod';
import { PublicCloudDecisionRequestBodySchema } from '@/schema';
import makeDecisionRequest, {
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
  validations: { pathParams: pathParamSchema, body: PublicCloudDecisionRequestBodySchema },
});
export const POST = apiHandler(async ({ pathParams, body, session }) => {
  if (!session) {
    return NextResponse.json('You must be an admin to make a request decision.', { status: 403 });
  }

  const { userEmail } = session;
  const { licencePlate } = pathParams;
  const { decision, decisionComment, ...requestedProjectFormData } = body;

  const request: PublicCloudRequestWithProjectAndRequestedProject = await makeDecisionRequest(
    licencePlate,
    decision,
    decisionComment,
    requestedProjectFormData,
    userEmail as string,
  );

  if (!request.requestedProject) {
    return NextResponse.json(`Error creating decision request for ${request.licencePlate}`, { status: 400 });
  }

  if (request.decisionStatus !== DecisionStatus.APPROVED) {
    wrapAsync(() => sendRequestRejectionEmails(request.requestedProject, decisionComment));
    return NextResponse.json(`Request for ${request.licencePlate} successfully created as rejected.`);
  }
  if (
    request.decisionStatus === DecisionStatus.APPROVED &&
    request.project?.expenseAuthorityId !== request.requestedProject.expenseAuthorityId
  ) {
    wrapAsync(() => sendExpenseAuthorityEmail(request.requestedProject));
  }

  await sendPublicCloudNatsMessage(request.type, request.requestedProject, request.project);

  // Subscribe users to Mautic
  const users: User[] = [
    request.requestedProject.projectOwner,
    request.requestedProject.primaryTechnicalLead,
    request.requestedProject?.secondaryTechnicalLead,
  ].filter((usr): usr is User => Boolean(usr));

  await subscribeUsersToMautic(users, request.requestedProject.provider, 'Public');

  // TODO: revisit to delete for good
  // sendRequestApprovalEmails(request);

  return NextResponse.json(`Decision request for ${request.licencePlate} successfully created.`);
});
