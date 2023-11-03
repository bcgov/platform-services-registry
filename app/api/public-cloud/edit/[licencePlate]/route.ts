import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PublicCloudRequest } from '@prisma/client';
import prisma from '@/lib/prisma';
import { User } from '@prisma/client';
import { PublicCloudEditRequestBodySchema, PublicCloudEditRequestBody, UserInput } from '@/schema';
import { string, z } from 'zod';
import editRequest from '@/requestActions/public-cloud/editRequest';
import { PublicCloudRequestWithProjectAndRequestedProject } from '@/requestActions/public-cloud/createRequest';
import { subscribeUsersToMautic } from '@/mautic';
import { sendPublicCloudNatsMessage } from '@/nats';
// import { sendCreateRequestEmails } from "@/ches/emailHandlers.js";

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

  const { email: authEmail, roles: authRoles } = session.user;

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
    !authRoles.includes('admin')
  ) {
    throw new Error('You need to assign yourself to this project in order to create it.');
  }

  const existingRequest: PublicCloudRequest | null = await prisma.publicCloudRequest.findFirst({
    where: {
      AND: [{ licencePlate }, { active: true }],
    },
  });

  if (existingRequest !== null) {
    throw new Error('This project already has an active request or it does not exist.');
  }

  const request: PublicCloudRequestWithProjectAndRequestedProject = await editRequest(
    licencePlate,
    formData,
    authEmail,
  );

  await sendPublicCloudNatsMessage(request.type, request.requestedProject, request.project);

  const users: User[] = [
    request.requestedProject.projectOwner,
    request.requestedProject.primaryTechnicalLead,
    request.requestedProject?.secondaryTechnicalLead,
  ].filter((user): user is User => Boolean(user));

  await subscribeUsersToMautic(users, request.requestedProject.provider, 'Private');

  // await sendEditRequestEmails(
  //   editRequest.project,
  //   editRequest.requestedProject
  // );

  return new NextResponse('Successfuly created and provisioned edit request ', { status: 200 });
}
