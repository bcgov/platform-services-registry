import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import withErrorHandler from '@/helpers/apiErrorHandler';
import { authOptions } from '@/app/api/auth/options';
import { PrivateCloudCreateRequestBody, PrivateCloudCreateRequestBodySchema } from '@/schema';
import createRequest, {
  PrivateCloudRequestWithProjectAndRequestedProject,
} from '@/requestActions/private-cloud/createRequest';
import { sendNewRequestEmails } from '@/ches/emailHandler';

export const POST = withErrorHandler(async (req: NextRequest) => {
  // Authentication
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse('You do not have the required credentials.', {
      status: 401,
    });
  }

  const { email: authEmail, roles: authRoles } = session.user;

  // Validation
  const body = await req.json();
  const parsedBody = PrivateCloudCreateRequestBodySchema.safeParse(body);

  if (!parsedBody.success) {
    return new NextResponse(parsedBody.error.message, { status: 400 });
  }

  const formData: PrivateCloudCreateRequestBody = parsedBody.data;

  // Authorization
  if (
    ![
      formData.projectOwner.email,
      formData.primaryTechnicalLead.email,
      formData.secondaryTechnicalLead?.email,
    ].includes(authEmail) &&
    !authRoles.includes('admin')
  ) {
    throw new Error('You need to assign yourself to this project in order to create it.');
  }

  // Action
  const request: PrivateCloudRequestWithProjectAndRequestedProject = await createRequest(formData, authEmail);

  sendNewRequestEmails(request);

  return new NextResponse('Success creating request', {
    status: 200,
  });
});
