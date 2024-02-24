import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { DecisionStatus, User } from '@prisma/client';
import { string, z } from 'zod';
import { PublicCloudDecisionRequestBodySchema } from '@/schema';
import makeDecisionRequest, {
  PublicCloudRequestWithProjectAndRequestedProject,
} from '@/requestActions/public-cloud/decisionRequest';
import { sendPublicCloudNatsMessage } from '@/nats';
import { subscribeUsersToMautic } from '@/mautic';
import { sendRequestApprovalEmails, sendRequestRejectionEmails } from '@/ches/public-cloud/emailHandler';

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

  const { email: authEmail, roles: authRoles } = session.user;

  if (!authRoles.includes('admin')) {
    return new NextResponse('You must be an admin to make a request decision.', {
      status: 403,
    });
  }

  const body = await req.json();

  // Validation
  const parsedParams = ParamsSchema.safeParse(params);
  const parsedBody = PublicCloudDecisionRequestBodySchema.safeParse(body);

  if (!parsedParams.success) {
    console.log(parsedParams.error.message);
    return new Response(parsedParams.error.message, { status: 400 });
  }

  if (!parsedBody.success) {
    console.log(parsedBody.error.message);
    return new Response(parsedBody.error.message, { status: 400 });
  }

  const { licencePlate } = parsedParams.data;
  const { decision, adminComment, ...requestedProjectFormData } = parsedBody.data;

  const request: PublicCloudRequestWithProjectAndRequestedProject = await makeDecisionRequest(
    licencePlate,
    decision,
    adminComment,
    requestedProjectFormData,
    authEmail,
  );

  if (!request.requestedProject) {
    return new Response(`Error creating decision request for ${request.licencePlate}.`, {
      status: 400,
    });
  }

  if (request.decisionStatus !== DecisionStatus.APPROVED) {
    sendRequestRejectionEmails(request.requestedProject, adminComment);
    return new Response(
      `Decision request for ${request.licencePlate} successfully created. Admin approval is required`,
      {
        status: 200,
      },
    );
  }

  await sendPublicCloudNatsMessage(request.type, request.requestedProject, request.project);

  // Subscribe users to Mautic
  const users: User[] = [
    request.requestedProject.projectOwner,
    request.requestedProject.primaryTechnicalLead,
    request.requestedProject?.secondaryTechnicalLead,
  ].filter((user): user is User => Boolean(user));

  await subscribeUsersToMautic(users, request.requestedProject.provider, 'Public');

  // TODO: revisit to delete for good
  // sendRequestApprovalEmails(request);

  return new NextResponse(`Decision request for ${request.licencePlate} successfully created and provisioned.`, {
    status: 200,
  });
}
