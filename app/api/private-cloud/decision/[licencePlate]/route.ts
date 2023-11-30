import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { DecisionStatus, Cluster, User } from '@prisma/client';
import { string, z } from 'zod';
import { PrivateCloudDecisionRequestBodySchema } from '@/schema';
import makeDecisionRequest, {
  PrivateCloudRequestWithRequestedProject,
} from '@/requestActions/private-cloud/decisionRequest';
import { sendPrivateCloudNatsMessage } from '@/nats';
import { subscribeUsersToMautic } from '@/mautic';
import { sendRequestApprovalEmails, sendDenialEmails } from '@/ches/emailHandler';

const ParamsSchema = z.object({
  licencePlate: string(),
});

type Params = z.infer<typeof ParamsSchema>;

export async function POST(req: NextRequest, { params }: { params: Params }) {
  // Athentication
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse('You do not have the required credentials.', {
      status: 401,
    });
  }

  const { email: authEmail, roles: authRoles } = session.user;

  if (!authRoles.includes('admin')) {
    return new NextResponse('You must be an admin to make a request decision.', {
      status: 403,
    });
  }

  const body = await req.json();
  const { comment, ...data } = body;

  // Validation
  const parsedParams = ParamsSchema.safeParse(params);
  const parsedBody = PrivateCloudDecisionRequestBodySchema.safeParse(data);
  console.log('params', parsedParams);
  console.log('body', parsedBody);

  if (!parsedParams.success) {
    console.log(parsedParams.error.message);
    return new Response(parsedParams.error.message, { status: 400 });
  }

  if (!parsedBody.success) {
    console.log(parsedBody.error.message);
    return new Response(parsedBody.error.message, { status: 400 });
  }

  const { licencePlate } = parsedParams.data;
  const { decision, humanComment, ...requestedProjectFormData } = parsedBody.data;

  const request: PrivateCloudRequestWithRequestedProject = await makeDecisionRequest(
    licencePlate,
    decision,
    humanComment,
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
    sendDenialEmails(request, comment);
    return new NextResponse(`Request for ${request.licencePlate} succesfully created as rejected.`, {
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
  ].filter((user): user is User => Boolean(user));

  // Subscribe users to Mautic
  await subscribeUsersToMautic(users, request.requestedProject.cluster, 'Private');

  // Send emails
  sendRequestApprovalEmails(request);

  return new NextResponse(`Decision request for ${request.licencePlate} succesfully created.`, {
    status: 200,
  });
}
