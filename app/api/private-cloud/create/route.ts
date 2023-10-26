import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Prisma } from '@prisma/client';
import { PrivateCloudCreateRequestBodySchema, PrivateCloudCreateRequestBody } from '@/schema';
import { PrivateCloudRequest } from '@prisma/client';
import createRequest from '@/requestActions/private-cloud/createRequest';
import { sendCreateRequestEmails } from '@/ches/emailHandler';
// import { sendCreateRequestEmails } from "@/ches/emailHandlers.js";

export async function POST(req: NextRequest) {
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
  try {
    await createRequest(formData, authEmail);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error(e.message);
    }
    throw e;
  }

  sendCreateRequestEmails(formData);

  // return NextResponse.json(request, {
  //   status: 200,
  // });

  return new NextResponse('Success creating request', {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
