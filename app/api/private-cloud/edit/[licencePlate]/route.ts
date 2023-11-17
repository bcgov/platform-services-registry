import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { PrivateCloudRequest, User, DecisionStatus, Cluster } from '@prisma/client';
import prisma from '@/lib/prisma';
import { PrivateCloudEditRequestBodySchema, PrivateCloudEditRequestBody } from '@/schema';
import { string, z } from 'zod';
import editRequest from '@/requestActions/private-cloud/editRequest';
import { PrivateCloudRequestWithProjectAndRequestedProject } from '@/requestActions/private-cloud/editRequest';
import { subscribeUsersToMautic } from '@/mautic';
import { sendPrivateCloudNatsMessage } from '@/nats';
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
  const parsedBody = PrivateCloudEditRequestBodySchema.safeParse(body);

  if (!parsedParams.success) {
    return new NextResponse(parsedParams.error.message, { status: 400 });
  }

  if (!parsedBody.success) {
    return new NextResponse(parsedBody.error.message, { status: 400 });
  }

  const formData: PrivateCloudEditRequestBody = parsedBody.data;
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

  const existingRequest: PrivateCloudRequest | null = await prisma.privateCloudRequest.findFirst({
    where: {
      AND: [{ licencePlate }, { active: true }],
    },
  });

  if (existingRequest !== null) {
    throw new Error('This project already has an active request or it does not exist.');
  }

  const request: PrivateCloudRequestWithProjectAndRequestedProject = await editRequest(
    licencePlate,
    formData,
    authEmail,
  );

  if (request.decisionStatus !== DecisionStatus.APPROVED) {
    return new NextResponse(
      'Successfuly edited project, admin approval will be required for this request to be provisioned ',
      { status: 200 },
    );
  }

  const contactChanged =
    formData.projectOwner.email !== request.requestedProject.projectOwner.email ||
    formData.primaryTechnicalLead.email !== request.requestedProject.primaryTechnicalLead.email ||
    formData.secondaryTechnicalLead?.email !== request.requestedProject?.secondaryTechnicalLead?.email;

  await sendPrivateCloudNatsMessage(request.id, request.type, request.requestedProject, contactChanged);

  if (request.requestedProject.cluster === Cluster.GOLD) {
    const goldDrRequest = { ...request };
    goldDrRequest.requestedProject.cluster = Cluster.GOLDDR;
    await sendPrivateCloudNatsMessage(request.id, request.type, request.requestedProject, contactChanged);
    await sendPrivateCloudNatsMessage(
      goldDrRequest.id,
      goldDrRequest.type,
      goldDrRequest.requestedProject,
      contactChanged,
    );
  }

  // await sendEditRequestEmails(
  //   editRequest.project,
  //   editRequest.requestedProject
  // );

  // Subscribe users to Mautic
  const users: User[] = [
    request.requestedProject.projectOwner,
    request.requestedProject.primaryTechnicalLead,
    request.requestedProject?.secondaryTechnicalLead,
  ].filter((user): user is User => Boolean(user));

  await subscribeUsersToMautic(users, request.requestedProject.cluster, 'Private');

  return new NextResponse('success', { status: 200 });
}
