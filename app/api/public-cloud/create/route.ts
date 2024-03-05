import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { PublicCloudCreateRequestBodySchema } from '@/schema';
import createRequest from '@/requestActions/public-cloud/createRequest';
import { sendCreateRequestEmails } from '@/services/ches/public-cloud/emailHandler';

export async function POST(req: NextRequest) {
  // Authentication
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse('You do not have the required credentials.', {
      status: 401,
    });
  }

  const { isAdmin, user, roles: authRoles } = session ?? {};
  const { email: authEmail } = user ?? {};

  // Validation
  const body = await req.json();

  const parsedBody = PublicCloudCreateRequestBodySchema.safeParse(body);

  if (!parsedBody.success) {
    return new NextResponse(parsedBody.error.message, { status: 400 });
  }

  const formData = parsedBody.data;

  // Authorization
  if (
    ![
      formData.projectOwner.email,
      formData.primaryTechnicalLead.email,
      formData.secondaryTechnicalLead?.email,
    ].includes(authEmail) &&
    !isAdmin
  ) {
    throw new Error('You need to assign yourself to this project in order to create it.');
  }

  // Action
  const request = await createRequest(formData, authEmail);

  sendCreateRequestEmails(request);

  return new NextResponse('Created successfuly', {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
