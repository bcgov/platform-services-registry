import { NextRequest, NextResponse } from 'next/server';
import { Cluster, DecisionStatus, User } from '@prisma/client';
import { PermissionsEnum } from '@/types/permissions';
import { z } from 'zod';
import { PrivateCloudDecisionRequestBodySchema } from '@/schema';
import makeDecisionRequest, {
  PrivateCloudRequestWithRequestedProject,
} from '@/request-actions/private-cloud/decision-request';
import createApiHandler from '@/core/api-handler';
import { sendPrivateCloudNatsMessage } from '@/services/nats';
import { subscribeUsersToMautic } from '@/services/mautic';
import { sendRequestApprovalEmails, sendRequestRejectionEmails } from '@/services/ches/private-cloud/email-handler';
import { wrapAsync } from '@/helpers/runtime';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const apiHandler = createApiHandler({
  roles: ['user'],
  permissions: [PermissionsEnum.ReviewAllPrivateCloudRequests],
  validations: { pathParams: pathParamSchema, body: PrivateCloudDecisionRequestBodySchema },
});
export const POST = apiHandler(async ({ pathParams, body, session }) => {
  if (!session) {
    return NextResponse.json('You must be an admin to make a request decision.', { status: 403 });
  }

  const { userEmail } = session;
  const { licencePlate } = pathParams;
  const { decision, decisionComment, ...requestedProjectFormData } = body;

  const request: PrivateCloudRequestWithRequestedProject = await makeDecisionRequest(
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
    // Send rejection email, message will need to be passed
    wrapAsync(() => sendRequestRejectionEmails(request.requestedProject, decisionComment));

    return NextResponse.json(`Request for ${request.licencePlate} successfully created as rejected.`);
  }

  const contactsChanged =
    requestedProjectFormData.projectOwner.email !== request.requestedProject.projectOwner.email ||
    requestedProjectFormData.primaryTechnicalLead.email !== request.requestedProject.primaryTechnicalLead.email ||
    requestedProjectFormData.secondaryTechnicalLead?.email !== request.requestedProject?.secondaryTechnicalLead?.email;

  await sendPrivateCloudNatsMessage(request.id, request.type, request.requestedProject, contactsChanged);

  // For GOLD requests, we create an identical request for GOLDDR
  if (request.requestedProject.cluster === Cluster.GOLD) {
    await sendPrivateCloudNatsMessage(
      request.id,
      request.type,
      { ...request.requestedProject, cluster: Cluster.GOLDDR },
      contactsChanged,
    );
  }

  const users: User[] = [
    request.requestedProject.projectOwner,
    request.requestedProject.primaryTechnicalLead,
    request.requestedProject?.secondaryTechnicalLead,
  ].filter((usr): usr is User => Boolean(usr));

  // Subscribe users to Mautic
  await subscribeUsersToMautic(users, request.requestedProject.cluster, 'Private');

  // TODO: revisit to delete for good
  // sendRequestApprovalEmails(request);

  return NextResponse.json(`Decision request for ${request.licencePlate} successfully created.`);
});
