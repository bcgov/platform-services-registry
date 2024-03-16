import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/core/auth-options';
import { DecisionStatus, User } from '@prisma/client';
import { string, z } from 'zod';
import { PublicCloudDecisionRequestBodySchema } from '@/schema';
import makeDecisionRequest, {
  PublicCloudRequestWithProjectAndRequestedProject,
} from '@/request-actions/public-cloud/decision-request';
import { sendPublicCloudNatsMessage } from '@/services/nats';
import { subscribeUsersToMautic } from '@/services/mautic';
import { sendExpenseAuthorityEmail, sendRequestRejectionEmails } from '@/services/ches/public-cloud/email-handler';
import { wrapAsync } from '@/helpers/runtime';

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
  const { decision, decisionComment, ...requestedProjectFormData } = parsedBody.data;

  const request: PublicCloudRequestWithProjectAndRequestedProject = await makeDecisionRequest(
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
    wrapAsync(() => sendRequestRejectionEmails(request.requestedProject, decisionComment));
    return new Response(
      `Decision request for ${request.licencePlate} successfully created. Admin approval is required`,
      {
        status: 200,
      },
    );
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
  ].filter((usr): usr is User => Boolean(user));

  await subscribeUsersToMautic(users, request.requestedProject.provider, 'Public');

  // TODO: revisit to delete for good
  // sendRequestApprovalEmails(request);

  return new NextResponse(`Decision request for ${request.licencePlate} successfully created and provisioned.`, {
    status: 200,
  });
}
