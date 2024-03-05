import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { Cluster, DecisionStatus, User } from '@prisma/client';
import { string, z } from 'zod';
import { PrivateCloudDecisionRequestBodySchema } from '@/schema';
import makeDecisionRequest, {
  PrivateCloudRequestWithRequestedProject,
} from '@/request-actions/private-cloud/decision-request';
import { sendPrivateCloudNatsMessage } from '@/services/nats';
import { subscribeUsersToMautic } from '@/services/mautic';
import { sendRequestApprovalEmails, sendRequestRejectionEmails } from '@/services/ches/private-cloud/email-handler';

const ParamsSchema = z.object({
  licencePlate: string(),
});

type Params = z.infer<typeof ParamsSchema>;

export async function POST(req: NextRequest, { params }: { params: Params }) {
  // Authentication
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse('You do not have the required credentials.', {
      status: 401,
    });
  }

  const { isAdmin, roles, user } = session;
  const { email: authEmail } = user;

  if (!isAdmin) {
    return new NextResponse('You must be an admin to make a request decision.', {
      status: 403,
    });
  }

  const body = await req.json();

  // Validation
  const parsedParams = ParamsSchema.safeParse(params);
  const parsedBody = PrivateCloudDecisionRequestBodySchema.safeParse(body);

  if (!parsedParams.success) {
    console.log(parsedParams.error.message);
    return new Response(parsedParams.error.message, { status: 400 });
  }

  if (!parsedBody.success) {
    console.log(parsedBody.error.message);
    return new Response(parsedBody.error.message, { status: 400 });
  }

  const { licencePlate } = parsedParams.data;
  const { decision, decisionComment, ...requestedProjectFormData } = parsedBody.data;

  const request: PrivateCloudRequestWithRequestedProject = await makeDecisionRequest(
    licencePlate,
    decision,
    decisionComment,
    requestedProjectFormData,
    authEmail,
  );

  if (!request.requestedProject) {
    return new Response(`Error creating decision request for ${request.licencePlate}.`, {
      status: 400,
    });
  }
  if (request.decisionStatus !== DecisionStatus.APPROVED) {
    // Send rejection email, message will need to be passed
    sendRequestRejectionEmails(request.requestedProject, decisionComment);
    return new NextResponse(`Request for ${request.licencePlate} successfully created as rejected.`, {
      status: 200,
    });
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
  ].filter((usr): usr is User => Boolean(user));

  // Subscribe users to Mautic
  await subscribeUsersToMautic(users, request.requestedProject.cluster, 'Private');

  // TODO: revisit to delete for good
  // sendRequestApprovalEmails(request);

  return new NextResponse(`Decision request for ${request.licencePlate} successfully created.`, {
    status: 200,
  });
}
