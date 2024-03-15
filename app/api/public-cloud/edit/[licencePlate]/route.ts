import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/core/auth-options';
import { PublicCloudRequest, User } from '@prisma/client';
import prisma from '@/core/prisma';
import { PublicCloudEditRequestBody, PublicCloudEditRequestBodySchema, UserInput } from '@/schema';
import { string, z } from 'zod';
import editRequest from '@/request-actions/public-cloud/edit-request';
import { subscribeUsersToMautic } from '@/services/mautic';
import { sendPublicCloudNatsMessage } from '@/services/nats';
import { sendEditRequestEmails } from '@/services/ches/public-cloud/email-handler';
import { wrapAsync } from '@/helpers/runtime';

const ParamsSchema = z.object({
  licencePlate: string(),
});

type Params = z.infer<typeof ParamsSchema>;

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({
      message: 'You do not have the required credentials.',
    });
  }

  const { isAdmin, user, roles: authRoles } = session ?? {};
  const { email: authEmail } = user ?? {};

  const body = await req.json();

  const parsedParams = ParamsSchema.safeParse(params);
  const parsedBody = PublicCloudEditRequestBodySchema.safeParse(body);

  if (!parsedParams.success) {
    return new NextResponse(parsedParams.error.message, { status: 400 });
  }

  if (!parsedBody.success) {
    return new NextResponse(parsedBody.error.message, { status: 400 });
  }
  const formData: PublicCloudEditRequestBody = parsedBody.data;
  const { licencePlate } = parsedParams.data;

  if (
    ![
      formData.projectOwner.email,
      formData.primaryTechnicalLead.email,
      formData.secondaryTechnicalLead?.email,
    ].includes(authEmail) &&
    !(authRoles.includes('admin') || authRoles.includes(`ministry-${formData.ministry.toLocaleLowerCase()}-admin`))
  ) {
    throw new Error('You need to assign yourself to this project in order to edit it.');
  }

  const existingRequest: PublicCloudRequest | null = await prisma.publicCloudRequest.findFirst({
    where: {
      AND: [{ licencePlate }, { active: true }],
    },
  });

  if (existingRequest !== null) {
    throw new Error('This project already has an active request or it does not exist.');
  }

  const request = await editRequest(licencePlate, formData, authEmail);

  await sendPublicCloudNatsMessage(request.type, request.requestedProject, request.project);

  wrapAsync(() => {
    const users: User[] = [
      request.requestedProject.projectOwner,
      request.requestedProject.primaryTechnicalLead,
      request.requestedProject?.secondaryTechnicalLead,
    ].filter((usr): usr is User => Boolean(user));

    subscribeUsersToMautic(users, request.requestedProject.provider, 'Private');
    sendEditRequestEmails(request);
  });

  return new NextResponse('Successfully created and provisioned edit request ', { status: 200 });
}
